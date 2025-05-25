// src/types/paystub.ts
export interface PaystubSummary {
  refMesAno: string;
  competencia: string;
  nomeMes: string;
  ano: number;
}

export interface PaystubsListApiResponse {
  data: PaystubSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaystubEvent {
  id: string;
  codEvento: string;
  evento: string;
  tipoEvento: 'P' | 'D';
  referencia: string | number;
  valor: string | number;
  provento?: string | number | null;
  desconto?: string | number | null;
}

export interface PaystubHeader {
  cpf: string;
  cracha: string;
  funcao: string;
  nomeFunc: string;
  codArea: number;
  descArea: string;
  descDepartamento: string;
  totalProventos: string | number;
  totalDescontos: string | number;
  totalLiquido: string | number;
  competencia: string;
  refMesAno: string;
  nomeMes: string;
  ano: number;
  // Campos que parecem estar faltando no tipo mas são usados no JSX:
  codAgencia?: string; // Usado em Informações do Empregado
  conta?: string; // Usado em Informações do Empregado
  baseSalarial?: string | number; // Usado em Encargos
  fgts?: string | number; // Usado em Encargos
  baseInss?: string | number; // Usado em Encargos
  baseIrrf?: string | number; // Usado em Encargos
  baseFgts?: string | number; // Usado em Encargos
}

export interface PaystubDetails {
  // Renomeei para PaystubDetails para clareza
  header: PaystubHeader;
  events: PaystubEvent[];
}
