//apps/api/src/infra/database/typeorm/entities/paystub.entity.ts
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('paystubs') // Nome exato da tabela no banco - CORRETO
// @Index('paystubs_competencia_cracha_idx', ['competencia', 'cracha']) // MANTIDO - Bom para performance de queries
export class Paystub {
  @PrimaryColumn('text') // id como PK é uma boa prática
  id!: string;

  // Coluna 'cpf' na tabela 'paystubs' que usaremos para ligar ao 'Employee'
  @Index() // Adicionar um índice na coluna de FK é altamente recomendado para performance
  @Column({ type: 'text', name: 'cpf' }) // Adicionado name: 'cpf' explicitamente para clareza, embora TypeORM infira
  cpf!: string;

  @Column({ type: 'text' })
  cracha!: string;

  // Relacionamento: Muitos Paystubs pertencem a um Employee
  // @ManyToOne(() => Employee, (employee) => employee.paystubs, {
  //   onDelete: 'NO ACTION', // OU 'NO ACTION' ou 'CASCADE' - Decida a estratégia de deleção.
  //   // 'SET NULL': Se um Employee for deletado, o paystubs.cpf ficará NULL. (Requer que paystubs.cpf seja nullable)
  //   // 'NO ACTION': Impede a deleção do Employee se ele tiver paystubs. (Mais seguro para integridade)
  //   // 'CASCADE': Se um Employee for deletado, todos os seus paystubs também serão. (Use com cuidado)
  //   onUpdate: 'CASCADE', // Se o employes.cpf for atualizado (raro para um CPF), atualiza paystubs.cpf
  //   // eager: false, // Mantenha false para performance, carregue sob demanda.
  // })
  // @JoinColumn({ name: 'cpf', referencedColumnName: 'cpf' }) // Correto: paystubs.cpf -> employes.cpf
  // employee!: Employee; // Propriedade para acessar o objeto Employee relacionado

  @Column({ type: 'text', name: 'dmtu' })
  dmtu!: string;

  @Column({ type: 'text' })
  funcao!: string;

  @Column({ type: 'text', name: 'nomefunc' })
  nomeFunc!: string;

  @Column({ type: 'integer', name: 'codarea' })
  codArea!: number;

  @Column({ type: 'text', name: 'descarea' })
  descArea!: string;

  @Column({ type: 'text', name: 'descdepartamento' })
  descDepartamento!: string;

  @Column({ type: 'text', name: 'codevento' })
  codEvento!: string;

  @Column({ type: 'text' })
  evento!: string;

  @Column({ type: 'text', name: 'tipoevento' })
  tipoEvento!: string;

  @Column({ type: 'numeric', precision: 65, scale: 30 })
  referencia!: number;

  @Column({ type: 'numeric', precision: 65, scale: 30 })
  valor!: number;

  @Column({ type: 'text', name: 'codagencia' })
  codAgencia!: string;

  @Column({ type: 'text' })
  conta!: string;

  @Column({ type: 'numeric', precision: 65, scale: 30, nullable: true })
  provento?: number | null;

  @Column({ type: 'numeric', precision: 65, scale: 30, nullable: true })
  desconto?: number | null;

  @Column({
    type: 'numeric',
    precision: 65,
    scale: 30,
    name: 'basesalarial',
    nullable: true,
  })
  baseSalarial?: number | null;

  @Column({
    type: 'numeric',
    precision: 65,
    scale: 30,
    name: 'baseinss',
    nullable: true,
  })
  baseInss?: number | null;

  @Column({
    type: 'numeric',
    precision: 65,
    scale: 30,
    name: 'basefgts',
    nullable: true,
  })
  baseFgts?: number | null;

  @Column({ type: 'numeric', precision: 65, scale: 30, nullable: true })
  fgts?: number | null;

  @Column({
    type: 'numeric',
    precision: 65,
    scale: 30,
    name: 'baseirrf',
    nullable: true,
  })
  baseIrrf?: number | null;

  @Column({
    type: 'numeric',
    precision: 65,
    scale: 30,
    name: 'totalproventos',
    nullable: true,
  })
  totalProventos?: number | null;

  @Column({
    type: 'numeric',
    precision: 65,
    scale: 30,
    name: 'totaldescontos',
    nullable: true,
  })
  totalDescontos?: number | null;

  @Column({
    type: 'numeric',
    precision: 65,
    scale: 30,
    name: 'totalliquido',
    nullable: true,
  })
  totalLiquido?: number | null;

  // O índice `paystubs_competencia_cracha_idx` já incluía 'competencia',
  // então não precisa de um @Index separado para 'competencia' a menos que queira um índice só para ele.
  @Column({ type: 'timestamp', name: 'competencia' })
  competencia!: Date;

  @Column({ type: 'text', name: 'nomemes' })
  nomeMes!: string;

  @Column({ type: 'integer' })
  ano!: number;

  @Column({ type: 'text', name: 'refmesano' })
  refMesAno!: string;

  @Column({ type: 'timestamp', name: 'dataadm' })
  dataAdm!: Date;

  @Column({ type: 'timestamp', name: 'datanasc' })
  dataNasc!: Date;

  @Column({ type: 'text', name: 'nomemae', nullable: true })
  nomeMae?: string | null;

  @Column({ type: 'integer' })
  folha!: number;

  @Column({ type: 'text', nullable: true })
  status?: string | null;
}
