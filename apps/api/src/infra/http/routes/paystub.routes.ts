import { FastifyInstance } from 'fastify';
import { PaystubController } from '../../../modules/paystub/controllers/paystub.controller';

export async function paystubRoutes(app: FastifyInstance): Promise<void> {
  const paystubController = new PaystubController();

  // Rota para listar os RESUMOS MENSAIS de contracheques do funcionário logado (com paginação)
  // GET /api/v1/paystubs?page=1&limit=12
  app.get(
    '/paystubs', // Alterado para ser a rota principal de listagem de resumos mensais
    {
      onRequest: [app.authenticate],
      // A validação dos query params (page, limit) já está no controller
    },
    paystubController.listMyMonthlyPaystubSummaries, // <--- NOME DO MÉTODO CORRIGIDO
  );

  // Rota para obter os DETALHES COMPLETOS de um contracheque mensal específico
  // GET /api/v1/paystubs/details/ABRIL%2F2025 (o %2F é o '/' encodado para URL)
  // O Fastify decodifica automaticamente o parâmetro da rota.
  app.get(
    '/paystubs/details',
    {
      onRequest: [app.authenticate],
    },
    paystubController.getMyPaystubDetailsByCompetencyRef,
  );

  // Rota para obter uma LINHA DE EVENTO específica de um contracheque pelo seu ID único
  // GET /api/v1/paystubs/event/:id
  app.get(
    '/paystubs/event/:id',
    {
      onRequest: [app.authenticate],
    },
    paystubController.getMyPaystubEventById,
  );
}
