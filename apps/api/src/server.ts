// contracheque-app/apps/api/src/server.ts
import { env } from '@/config/env'; // Usando alias do tsconfig
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import 'reflect-metadata'; // Deve ser o primeiro import para TypeORM
// import { appRoutes } from '@/infra/http/routes'; // Futuramente

async function bootstrap() {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty' } }
        : true,
  });

  // Middlewares/Plugins Globais
  await app.register(helmet);
  await app.register(cors, {
    origin:
      env.NODE_ENV === 'development'
        ? '*'
        : 'SEU_DOMINIO_DE_PRODUCAO_DO_FRONTEND', // Ajustar para produção
    // credentials: true, // Se for usar cookies/sessões cross-origin
  });

  // Registrar Rotas (Exemplo simples por enquanto)
  app.get('/', async (_request, _reply) => {
    return { hello: 'world from Contrancheque API v0.1.0' };
  });

  app.get('/health', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Futuramente:
  // await app.register(appRoutes, { prefix: '/api/v1' }); // Prefixo para todas as rotas da API

  // Tratamento de Erro Global (Exemplo básico)
  app.setErrorHandler((error, request, reply) => {
    console.error(error); // Logar o erro completo no servidor

    // Em desenvolvimento, pode enviar o erro detalhado
    if (env.NODE_ENV === 'development') {
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack,
      });
    }

    // Em produção, mensagem genérica
    reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred.',
    });
  });

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' }); // host 0.0.0.0 é importante para Docker
    console.log(`�� HTTP server running on http://localhost:${env.PORT}`);
  } catch (err) {
    console.error('Failed to bootstrap the application:', err);
    process.exit(1);
  }
}

bootstrap();
