// contracheque-app/apps/api/src/server.ts
import dotenv from 'dotenv'; // Carregar variáveis de ambiente primeiro
import 'reflect-metadata'; // Deve ser o primeiro import para TypeORM

// Configurar dotenv no início
dotenv.config();

import { env } from '@/config/env'; // Usando alias do tsconfig
import { initializeDataSource } from '@/infra/database/typeorm/data-source';
import { appRoutes } from '@/infra/http/routes';
import { AppError } from '@/shared/errors/AppError';
import fastifyCors from '@fastify/cors'; // Usar o nome do pacote ou um alias consistente
import fastifyHelmet from '@fastify/helmet'; // Usar o nome do pacote ou um alias consistente
import fastifyJwt from '@fastify/jwt';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod'; // Importar ZodError explicitamente

// (Opcional, mas recomendado para tipagem do request.user)
// Crie um arquivo, por exemplo, src/types/fastify-jwt.d.ts e coloque o conteúdo abaixo:
/*
  // src/types/fastify-jwt.d.ts
  import '@fastify/jwt';

  declare module '@fastify/jwt' {
    interface FastifyJWT {
      payload: { // Defina os campos que você espera no payload do token
        id: string;
        cpf: string;
        cracha: string;
        // Adicione outros campos conforme necessário
      };
      user: { // Este será o request.user
        id: string;
        cpf: string;
        cracha: string;
        // Adicione outros campos conforme necessário
        iat?: number;
        exp?: number;
      };
    }
  }
*/

async function bootstrap() {
  try {
    // 1. Inicializa o Data Source
    await initializeDataSource();
    console.log('��️  Database initialized successfully.');

    // 2. Cria a instância do Fastify
    const app = Fastify({
      logger:
        env.NODE_ENV === 'development'
          ? {
              transport: {
                target: 'pino-pretty',
                options: {
                  translateTime: 'HH:MM:ss Z',
                  ignore: 'pid,hostname',
                },
              },
            }
          : true, // Em produção, usar o logger padrão do Fastify (JSON)
    });

    // 3. Registrar Plugins Globais
    // Helmet para segurança básica de headers HTTP
    await app.register(fastifyHelmet);
    app.log.info('Helmet plugin registrado.');

    // CORS para permitir requisições cross-origin
    await app.register(fastifyCors, {
      origin: (origin, callback) => {
        const allowedOrigins =
          env.NODE_ENV === 'development'
            ? [
                'http://localhost:3000',
                'http://10.10.100.79:3001',
                'http://192.168.1.221:3000',
                'http://contracheque.vpioneira.com.br:3001',
                'http://192.168.2.115:3000',
                undefined,
              ] // Permite localhost e requisições sem origin (ex: Postman)
            : [env.FRONTEND_URL_PROD]; // Em produção, apenas a URL do frontend

        if (!allowedOrigins.includes(origin) && origin !== undefined) {
          // Adicionado origin !== undefined para o caso de '*' não ser desejado explicitamente
          return callback(new Error(`Not allowed by CORS: ${origin}`), false);
        }
        callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      // credentials: true, // Descomente se você precisar lidar com cookies/sessões via CORS
    });
    app.log.info('CORS plugin registrado.');

    // JWT para autenticação baseada em token
    if (!env.JWT_SECRET) {
      app.log.error(
        'FATAL: JWT_SECRET não está definido nas variáveis de ambiente!',
      );
      process.exit(1);
    }
    await app.register(fastifyJwt, {
      secret: env.JWT_SECRET,
      sign: {
        expiresIn: env.JWT_EXPIRES_IN || '1h', // Garante um fallback se JWT_EXPIRES_IN não estiver no .env
      },
      // messages: { // Opcional: Customizar mensagens de erro do JWT
      //   badRequestErrorMessage: 'Formato do token inválido.',
      //   noAuthorizationInHeaderMessage: 'Token de autorização ausente no cabeçalho.',
      //   authorizationTokenExpiredMessage: 'Token de autorização expirado.',
      //   authorizationTokenInvalid: (err) => `Token de autorização inválido: ${err.message}`
      // }
    });
    app.log.info('JWT plugin registrado.');

    // 4. Decorador de Autenticação
    app.decorate(
      'authenticate',
      async function (request: FastifyRequest, reply: FastifyReply) {
        try {
          await request.jwtVerify(); // Verifica o token e popula request.user
        } catch (err: any) {
          // Tipar o erro para acessar suas propriedades
          app.log.warn(
            { error: { message: err.message, name: err.name } },
            'Falha na autenticação JWT',
          );
          reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: err.message || 'Invalid or missing token', // Usa a mensagem do erro do JWT se disponível
          });
        }
      },
    );
    app.log.info('Decorador "authenticate" adicionado.');

    // 5. Registrar Rotas da Aplicação
    await app.register(appRoutes, { prefix: '/api/v1' });
    app.log.info('Rotas da aplicação registradas com prefixo /api/v1.');

    // Rotas de exemplo (podem ser removidas se appRoutes já as cobrir)
    app.get('/', async (_request, _reply) => {
      return {
        message: 'Bem-vindo à API Contrancheque!',
        version: '0.1.0', // Adicionar versão pode ser útil
        environment: env.NODE_ENV,
      };
    });

    app.get('/health', async (_request, _reply) => {
      // Adicionar mais verificações de saúde se necessário (ex: status do DB)
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
      };
    });

    // 6. Tratamento de Erro Global
    app.setErrorHandler((error: any, _request, reply) => {
      // Tipar error como any ou unknown para checagem
      app.log.error(error, 'Erro capturado pelo setErrorHandler:');

      if (error instanceof ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: 'Dados de entrada inválidos.',
          details: error.format(),
        });
      }

      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          statusCode: error.statusCode,
          error: error.name === 'AppError' ? 'Application Error' : error.name,
          message: error.message,
          details: error.details,
        });
      }

      // Em produção, mensagem genérica para erros não esperados
      if (
        env.NODE_ENV === 'production' &&
        !(error instanceof AppError || error instanceof ZodError)
      ) {
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Ocorreu um erro inesperado no servidor.',
        });
      }

      // Em desenvolvimento, enviar mais detalhes do erro não esperado
      // Cuidado ao expor stack traces em ambientes acessíveis externamente
      return reply.status(error.statusCode || 500).send({
        // Usar error.statusCode se existir
        statusCode: error.statusCode || 500,
        error: error.name || 'Internal Server Error',
        message: error.message,
        stack: env.NODE_ENV !== 'production' ? error.stack : undefined, // Expor stack apenas em dev
      });
    });

    // 7. Iniciar o Servidor
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    // O logger do Fastify já informa sobre o servidor rodando se configurado adequadamente
    // app.log.info(`🚀 HTTP server running on port ${env.PORT}`); // Pode ser redundante ou útil para clareza
  } catch (error) {
    console.error('❌ Failed to bootstrap the application:', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Unhandled error during bootstrap process:', err);
  process.exit(1);
});
