// apps/api/src/infra/http/controllers/auth.controller.ts
import { resetPasswordSchema } from '@/modules/auth/dtos/reset-password.dto';
import { AuthService } from '@/modules/auth/services/auth.service';
import { AppError } from '@/shared/errors/AppError';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService(); // Instanciando diretamente; considere DI
  }

  async resetPassword(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      // 1. Validar o corpo da requisição com o schema Zod
      const resetPasswordData = resetPasswordSchema.parse(request.body);

      // 2. Chamar o serviço para processar a redefinição de senha
      await this.authService.resetPassword(resetPasswordData);

      // 3. Responder com sucesso (sem corpo, pois a operação foi bem-sucedida e não retorna dados)
      return reply.status(204).send(); // 204 No Content é apropriado aqui
    } catch (error: any) {
      if (error instanceof ZodError) {
        // request.log.warn({ errors: error.format() }, 'Password reset validation failed'); // Se tiver logger
        return reply.status(400).send({
          message: 'Validation failed. Please check your input.',
          errors: error.flatten().fieldErrors, // Fornece erros por campo
        });
      }
      if (error instanceof AppError) {
        // AppError já deve ser tratado pelo handler de erro global, se configurado
        // Mas para garantir, podemos retornar aqui também
        // request.log.info({ err: error }, `AppError during password reset: ${error.message}`);
        return reply.status(error.statusCode).send({ message: error.message });
      }

      // Para outros erros inesperados
      // request.log.error(error, 'Unexpected error during password reset in controller');
      console.error('UNEXPECTED_ERROR in AuthController.resetPassword:', error);
      return reply.status(500).send({
        message: 'Password reset failed due to an unexpected internal error.',
      });
    }
  }

  // Você pode adicionar outros métodos de autenticação aqui no futuro (ex: login, refresh token)
  // async login(request: FastifyRequest, reply: FastifyReply) { /* ... */ }
}
