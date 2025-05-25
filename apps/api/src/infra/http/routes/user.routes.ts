//apps/api/src/infra/http/routes/user.routes.ts
import { UserController } from '@/modules/users/controllers/user.controller';
import { FastifyInstance } from 'fastify';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const userController = new UserController();

  app.post('/users', userController.create);
  app.get('/users', userController.getAll); // Protegerei esta rota depois
  app.get('/users/:id', userController.getById); // Protegerei esta rota depois
  app.put('/users/:id', userController.update); // Protegerei esta rota depois
  app.delete('/users/:id', userController.delete); // Protegerei esta rota depois
}
