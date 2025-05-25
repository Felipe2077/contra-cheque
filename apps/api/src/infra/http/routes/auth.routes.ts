import { UserService } from '@/modules/users/services/user.service';
import { AppError } from '@/shared/errors/AppError';
import bcrypt from 'bcryptjs';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller';

const cpfRegex = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/;

const loginSchema = z.object({
  cpf: z
    .string()
    .regex(cpfRegex, { message: 'Invalid CPF format' })
    .transform((val) => val.replace(/[^\d]/g, '')),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const userService = new UserService();
  const authController = new AuthController(); // <<< INSTANCIAR O AUTHCONTROLLER

  app.post(
    '/auth/login', // MANTIDO O PREFIXO '/auth' AQUI
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { cpf, password } = loginSchema.parse(request.body);

        const user = await userService.findByCpfWithPassword(cpf);
        if (!user || !user.password) {
          // Não logar a senha aqui
          app.log.warn(
            { cpf },
            'Login attempt failed: User not found or password not set.',
          );
          throw new AppError('Invalid CPF or password.', 401);
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          app.log.warn({ cpf }, 'Login attempt failed: Password mismatch.');
          throw new AppError('Invalid CPF or password.', 401);
        }

        // O payload do token já está como você definiu nos testes,
        // que inclui 'sub' (ID), 'cpf', 'email'.
        // Certifique-se que 'cracha' também está se você precisar dele no request.user
        // Se não, pode remover do payload para mantê-lo menor.
        const tokenPayload = {
          sub: user.id,
          cpf: user.cpf,
          email: user.email,
          cracha: user.cracha, // Adicionado cracha, como no seu teste de login
          // Adicione outros campos que você queira no token aqui
        };

        const token = await reply.jwtSign(tokenPayload);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _removedPassword, ...userWithoutPassword } = user;

        return reply.send({
          user: userWithoutPassword,
          token,
        });
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          app.log.warn({ errors: error.format() }, 'Login validation failed');
          throw new AppError('Validation failed', 400, error.format());
        }
        if (error instanceof AppError) {
          // Não precisa logar AppError aqui, pois o setErrorHandler global já o fará
          throw error;
        }
        app.log.error(error, 'Unexpected error during login');
        throw new AppError(
          'Login process failed due to an unexpected error.',
          500,
        );
      }
    },
  );

  app.get(
    '/auth/me', // MANTIDO O PREFIXO '/auth' AQUI
    { onRequest: [app.authenticate] }, // Protege a rota
    async (request: FastifyRequest, reply: FastifyReply) => {
      // request.user já contém o payload do token decodificado
      // conforme definido na tipagem FastifyJWT (sub, cpf, email, iat, exp, etc.)
      return reply.send({ user: request.user });
    },
  );

  // NOVA ROTA: /auth/profile
  app.get(
    '/auth/profile', // MANTIDO O PREFIXO '/auth' AQUI
    { onRequest: [app.authenticate] }, // Protege a rota
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // request.user.sub deve conter o ID do usuário do token JWT
        // Certifique-se que a tipagem do request.user (via fastify-jwt.d.ts)
        // inclui 'sub' como string.
        const userId = request.user.sub; // 'sub' é o padrão para o ID do sujeito no JWT

        if (!userId || typeof userId !== 'string') {
          app.log.error(
            { userId: request.user.sub },
            'User ID (sub) not found in token or is not a string for /auth/profile',
          );
          throw new AppError('Invalid token: User identifier missing.', 401);
        }

        const userProfile = await userService.findById(userId); // Usa o método do serviço

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _removedPassword, ...profileWithoutPassword } =
          userProfile;

        return reply.send({ profile: profileWithoutPassword });
      } catch (error: any) {
        // Se o userService.findById lança AppError(404), ele será pego aqui
        if (error instanceof AppError) {
          throw error; // Re-lança para ser tratado pelo setErrorHandler global
        }
        // Para outros erros inesperados
        app.log.error(error, 'Unexpected error fetching user profile');
        throw new AppError('Failed to fetch user profile.', 500);
      }
    },
  );

  // --- NOVA ROTA PARA RESET DE SENHA ---
  app.post(
    '/auth/reset-password', // A rota será /api/v1/auth/reset-password (se o prefixo '/auth' for aplicado ao registrar este arquivo)
    // Se você registrou este arquivo com prefixo /auth, então o path aqui deve ser só '/reset-password'
    // VERIFICAR COMO VOCÊ REGISTRA authRoutes em app.ts/server.ts
    authController.resetPassword.bind(authController), // Usando o método do AuthController
  );
  // --- FIM DA NOVA ROTA ---
}
