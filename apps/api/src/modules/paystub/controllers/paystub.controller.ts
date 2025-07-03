import { AppError } from '@/shared/errors/AppError';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PaystubService } from '../services/paystub.service';

// Schema para validação dos query params de paginação
const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(), // coerce converte string para número
  limit: z.coerce.number().int().positive().optional(),
});

// Novo schema para query parameter
const paystubDetailsQuerySchema = z.object({
  refMesAno: z.string().min(1, 'refMesAno query parameter is required'),
});

// Schema para validação dos params da rota de detalhes
const paystubDetailsParamsSchema = z.object({
  // refMesAno pode ser algo como "ABRIL/2025" ou "JANEIRO/2024".
  // Precisamos de um regex mais robusto se quisermos validar o formato exato,
  // ou podemos apenas tratar como string por enquanto.
  // Exemplo de regex simples (NOME_MES_MAIUSCULO/ANO_4_DIGITOS): /^[A-ZÇÃÕÁÉÍÓÚ]+\/\d{4}$/
  // Por simplicidade, vamos usar string e o serviço validará se encontra algo.
  refMesAno: z.string(),
});

// Schema para params da rota de evento individual
const paystubEventParamsSchema = z.object({
  id: z.string(), // Assumindo que o ID do evento é uma string (como no seu exemplo "AAAfr8AAmAALuMjAAN")
});

export class PaystubController {
  private paystubService: PaystubService;

  constructor() {
    this.paystubService = new PaystubService();
    this.listMyMonthlyPaystubSummaries =
      this.listMyMonthlyPaystubSummaries.bind(this);
    this.getMyPaystubDetailsByCompetencyRef =
      this.getMyPaystubDetailsByCompetencyRef.bind(this);
    this.getMyPaystubEventById = this.getMyPaystubEventById.bind(this); // Método renomeado
  }

  /**
   * Lista os resumos mensais de contracheques do funcionário logado, com paginação.
   */
  async listMyMonthlyPaystubSummaries(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const employeeCpf = request.user.cpf;
      if (!employeeCpf) {
        request.log.warn(
          'CPF not found in token for listMyMonthlyPaystubSummaries',
        );
        throw new AppError('User CPF not found in token.', 401);
      }

      // Validação dos query params (page, limit)
      const validationResult = paginationQuerySchema.safeParse(request.query);
      if (!validationResult.success) {
        throw new AppError(
          `Invalid query parameters: ${validationResult.error.flatten().fieldErrors}`,
          400,
        );
      }
      const { page, limit } = validationResult.data;

      const result = await this.paystubService.findMonthlyPaystubSummaries(
        employeeCpf,
        { page, limit },
      );

      reply.send(result);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      request.log.error(
        error,
        'Error in PaystubController.listMyMonthlyPaystubSummaries',
      );
      throw new AppError('Failed to list monthly paystub summaries.', 500);
    }
  }

  /**
   * Obtém os detalhes completos de um contracheque mensal específico do funcionário logado,
   * identificado pela referência MÊS/ANO.
   */
  async getMyPaystubDetailsByCompetencyRef(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const employeeCpf = request.user.cpf;
      if (!employeeCpf) {
        request.log.warn(
          'CPF not found in token for getMyPaystubDetailsByCompetencyRef',
        );
        throw new AppError('User CPF not found in token.', 401);
      }

      // Validação dos params da rota
      const queryValidationResult = paystubDetailsQuerySchema.safeParse(
        request.query,
      );
      if (!queryValidationResult.success) {
        throw new AppError(
          `Invalid query parameters: ${queryValidationResult.error.flatten().fieldErrors}`,
          400,
        );
      }
      const { refMesAno } = queryValidationResult.data;

      // O refMesAno da URL pode precisar de decodeURIComponent se contiver caracteres como '/'
      // mas o Fastify geralmente lida com isso. Se não, use:
      // const decodedRefMesAno = decodeURIComponent(refMesAno);

      const details =
        await this.paystubService.findPaystubDetailsByCompetencyRef(
          employeeCpf,
          refMesAno,
        );

      if (!details) {
        throw new AppError(
          'Paystub details not found for the specified competency reference.',
          404,
        );
      }

      reply.send(details);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      request.log.error(
        error,
        'Error in PaystubController.getMyPaystubDetailsByCompetencyRef',
      );
      throw new AppError('Failed to retrieve paystub details.', 500);
    }
  }

  /**
   * Obtém uma linha de evento de contracheque específica do funcionário logado pelo ID do evento.
   * (Método anterior renomeado e mantido para buscar um evento individual)
   */
  async getMyPaystubEventById(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const employeeCpf = request.user.cpf;
      if (!employeeCpf) {
        request.log.warn('CPF not found in token for getMyPaystubEventById');
        throw new AppError('User CPF not found in token.', 401);
      }

      const paramsValidationResult = paystubEventParamsSchema.safeParse(
        request.params,
      );
      if (!paramsValidationResult.success) {
        throw new AppError(
          `Invalid route parameters: ${paramsValidationResult.error.flatten().fieldErrors}`,
          400,
        );
      }
      const { id: eventId } = paramsValidationResult.data;

      const paystubEvent =
        await this.paystubService.findPaystubEventByIdAndEmployeeCpf(
          eventId,
          employeeCpf,
        );

      // O serviço já lança 404 se não encontrar ou não pertencer.
      reply.send(paystubEvent);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      request.log.error(
        error,
        'Error in PaystubController.getMyPaystubEventById',
      );
      throw new AppError('Failed to retrieve paystub event.', 500);
    }
  }
}
