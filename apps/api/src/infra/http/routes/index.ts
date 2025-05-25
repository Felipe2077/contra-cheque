// apps/api/src/infra/http/routes/index.ts
import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { paystubRoutes } from './paystub.routes';
import { userRoutes } from './user.routes';

// Importe outras rotas de módulos aqui no futuro
// import { authRoutes } from './auth.routes';

export async function appRoutes(app: FastifyInstance): Promise<void> {
  app.register(userRoutes); // Sem prefixo aqui, o prefixo /api/v1 será no server.ts
  app.register(authRoutes);

  // rotas de contracheque
  app.register(paystubRoutes); // <--- REGISTRE AS NOVAS ROTAS
}
