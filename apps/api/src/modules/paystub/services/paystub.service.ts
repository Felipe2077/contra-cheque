import { AppDataSource } from '@/infra/database/typeorm/data-source';
import { Paystub } from '@/infra/database/typeorm/entities/paystub.entity';
import { AppError } from '@/shared/errors/AppError';
import { Repository } from 'typeorm';

export interface ListPaystubsOptions {
  page?: number;
  limit?: number;
}

// Representa o resumo de um contracheque mensal para a lista
export interface MonthlyPaystubSummary {
  // Usaremos refMesAno como um identificador único para a competência na listagem
  refMesAno: string;
  competencia: Date; // A data exata da competência para ordenação
  nomeMes: string;
  ano: number;
  totalProventos?: number | null; // Pegar do primeiro registro da competência
  totalDescontos?: number | null; // Pegar do primeiro registro da competência
  totalLiquido?: number | null; // Pegar do primeiro registro da competência
  // Adicionar outros campos que você queira exibir no resumo
}

export interface PaginatedMonthlySummaryResult {
  data: MonthlyPaystubSummary[];
  total: number; // Total de meses com contracheques
  page: number;
  limit: number;
  totalPages: number;
}

// Representa os detalhes completos de um contracheque mensal
export interface MonthlyPaystubDetails {
  header: Omit<
    Paystub,
    | 'id'
    | 'codEvento'
    | 'evento'
    | 'tipoEvento'
    | 'referencia'
    | 'valor'
    | 'provento'
    | 'desconto'
  > & {
    // Ajuste Omit conforme necessário para remover campos específicos do evento
    // Adicionando de volta os totais explicitamente para clareza, mesmo que já estejam em Paystub
    totalProventos?: number | null;
    totalDescontos?: number | null;
    totalLiquido?: number | null;
  };
  events: Array<
    Pick<
      Paystub,
      | 'id'
      | 'codEvento'
      | 'evento'
      | 'tipoEvento'
      | 'referencia'
      | 'valor'
      | 'provento'
      | 'desconto'
    >
  >;
}

export class PaystubService {
  private paystubRepository: Repository<Paystub>;

  constructor() {
    this.paystubRepository = AppDataSource.getRepository(Paystub);
  }

  /**
   * Encontra resumos mensais de contracheques para um funcionário, paginados.
   * @param employeeCpf O CPF do funcionário.
   * @param options Opções de paginação (page, limit).
   * @returns Uma lista paginada de resumos mensais e metadados de paginação.
   */
  async findMonthlyPaystubSummaries(
    employeeCpf: string,
    options: ListPaystubsOptions = {},
  ): Promise<PaginatedMonthlySummaryResult> {
    if (!employeeCpf) {
      throw new AppError('Employee CPF is required.', 400);
    }

    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 12; // Ex: 12 meses por página
    const skip = (page - 1) * limit;

    // Query para obter as competências distintas e alguns dados do primeiro evento de cada competência
    const distinctCompetenciesQuery = this.paystubRepository
      .createQueryBuilder('p')
      .select([
        'p.refMesAno AS "refMesAno"', // Alias para corresponder à interface
        'p.competencia AS "competencia"',
        'p.nomeMes AS "nomeMes"',
        'p.ano AS "ano"',
        // Pegar os totais do primeiro registro (ou de qualquer um, já que são iguais por competência)
        'p.totalProventos AS "totalProventos"',
        'p.totalDescontos AS "totalDescontos"',
        'p.totalLiquido AS "totalLiquido"',
      ])
      .where('p.cpf = :cpf', { cpf: employeeCpf })
      .groupBy(
        'p.refMesAno, p.competencia, p.nomeMes, p.ano, p.totalProventos, p.totalDescontos, p.totalLiquido',
      ) // Agrupa para obter entradas únicas por mês
      .orderBy('p.competencia', 'DESC');

    // Obter o total de meses distintos
    const totalMonths = await distinctCompetenciesQuery.getCount();

    // Aplicar paginação
    const monthlySummariesRaw = await distinctCompetenciesQuery
      .offset(skip)
      .limit(limit)
      .getRawMany<MonthlyPaystubSummary>(); // Usar getRawMany para pegar os resultados com alias

    // Os valores numéricos podem vir como string do getRawMany, converter se necessário
    const monthlySummaries = monthlySummariesRaw.map((summary) => ({
      ...summary,
      totalProventos: summary.totalProventos
        ? parseFloat(summary.totalProventos as any)
        : null,
      totalDescontos: summary.totalDescontos
        ? parseFloat(summary.totalDescontos as any)
        : null,
      totalLiquido: summary.totalLiquido
        ? parseFloat(summary.totalLiquido as any)
        : null,
      ano: parseInt(summary.ano as any, 10),
    }));

    const totalPages = Math.ceil(totalMonths / limit);

    return {
      data: monthlySummaries,
      total: totalMonths,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Encontra todos os detalhes (eventos) de um contracheque para um funcionário e competência específicos.
   * @param employeeCpf O CPF do funcionário.
   * @param refMesAno A referência MÊS/ANO do contracheque (ex: "ABRIL/2025").
   * @returns Os detalhes do contracheque mensal.
   */
  async findPaystubDetailsByCompetencyRef(
    employeeCpf: string,
    refMesAno: string,
  ): Promise<MonthlyPaystubDetails | null> {
    if (!employeeCpf || !refMesAno) {
      throw new AppError(
        'Employee CPF and competency reference (refMesAno) are required.',
        400,
      );
    }

    const paystubEvents = await this.paystubRepository.find({
      where: {
        cpf: employeeCpf,
        refMesAno: refMesAno,
      },
      order: {
        // Você pode querer uma ordem específica para os eventos, ex: por tipo (Provento primeiro) e depois por código do evento
        tipoEvento: 'ASC', // 'D' (Desconto), 'P' (Provento) - pode precisar ajustar
        codEvento: 'ASC',
      },
    });

    if (!paystubEvents || paystubEvents.length === 0) {
      return null; // Ou lançar AppError 404 se preferir
    }

    // Pegar o primeiro evento para os dados de cabeçalho
    // (todos os campos comuns são iguais em todos os eventos de uma mesma competência)
    const headerData = paystubEvents[0];

    const details: MonthlyPaystubDetails = {
      header: {
        cpf: headerData.cpf,
        cracha: headerData.cracha,
        dmtu: headerData.dmtu,
        funcao: headerData.funcao,
        nomeFunc: headerData.nomeFunc,
        codArea: headerData.codArea,
        descArea: headerData.descArea,
        descDepartamento: headerData.descDepartamento,
        codAgencia: headerData.codAgencia,
        conta: headerData.conta,
        baseSalarial: headerData.baseSalarial,
        baseInss: headerData.baseInss,
        baseFgts: headerData.baseFgts,
        fgts: headerData.fgts,
        baseIrrf: headerData.baseIrrf,
        totalProventos: headerData.totalProventos,
        totalDescontos: headerData.totalDescontos,
        totalLiquido: headerData.totalLiquido,
        competencia: headerData.competencia,
        nomeMes: headerData.nomeMes,
        ano: headerData.ano,
        refMesAno: headerData.refMesAno,
        dataAdm: headerData.dataAdm,
        dataNasc: headerData.dataNasc,
        nomeMae: headerData.nomeMae,
        folha: headerData.folha,
        status: headerData.status,
      },
      events: paystubEvents.map((event) => ({
        id: event.id,
        codEvento: event.codEvento,
        evento: event.evento,
        tipoEvento: event.tipoEvento,
        referencia: event.referencia,
        valor: event.valor,
        provento: event.provento,
        desconto: event.desconto,
      })),
    };

    return details;
  }

  // O método original findPaystubByIdAndEmployeeCpf pode ser mantido se você quiser
  // buscar uma *linha de evento específica* por seu ID único, mas ele não representa
  // um contracheque mensal completo. Pode ser útil para alguma auditoria ou link direto.
  async findPaystubEventByIdAndEmployeeCpf(
    id: string,
    employeeCpf: string,
  ): Promise<Paystub> {
    // ... (lógica original mantida, mas renomeado para clareza) ...
    if (!id || !employeeCpf) {
      throw new AppError(
        'Paystub event ID and Employee CPF are required.',
        400,
      );
    }
    const paystub = await this.paystubRepository.findOne({
      where: { id: id, cpf: employeeCpf },
    });
    if (!paystub) {
      throw new AppError('Paystub event not found or access denied.', 404);
    }
    return paystub;
  }
}
