//apps/api/src/infra/database/typeorm/entities/employee.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Paystub } from './paystub.entity';

@Entity('employes') // Nome exato da tabela no banco - CORRETO
export class Employee {
  @PrimaryColumn('text') // id como PK é uma boa prática
  id!: string;

  // CPF é a chave natural e o que usamos para a FK.
  // É crucial que esta coluna seja única.
  // O @Index com unique:true já garante isso no nível do banco,
  // mas unique:true no @Column também é bom para o TypeORM.
  @Index({ unique: true }) // Se o índice já existe como 'employes_cpf_key', o TypeORM pode tentar recriá-lo ou usá-lo.
  // Se você quiser usar EXATAMENTE o nome 'employes_cpf_key', pode especificar:
  // @Index("employes_cpf_key", { unique: true })
  @Column({ type: 'text', unique: true, name: 'cpf' }) // Adicionado name: 'cpf' explicitamente
  cpf!: string;

  @Column({ type: 'text' })
  cracha!: string;

  @Column({ type: 'text', nullable: true })
  email?: string | null;

  @Column({ type: 'text', select: false })
  password!: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP', // Bom
    nullable: true, // Se os dados do dump não têm created_at, nullable:true é importante
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    nullable: true, // Se os dados do dump não têm updated_at, nullable:true é importante
    onUpdate: 'CURRENT_TIMESTAMP', // Bom
  })
  updatedAt?: Date;

  // Relacionamento: Um Employee pode ter muitos Paystubs
  // 'paystub.employee' é a propriedade na entidade Paystub que define o lado @ManyToOne
  @OneToMany(() => Paystub, (paystub) => paystub.employee, {
    // cascade: true, // CUIDADO: Se true, salvar/remover um Employee pode afetar Paystubs.
    // Geralmente não é necessário para OneToMany, a menos que você queira gerenciar
    // o ciclo de vida dos Paystubs através do Employee.
    // eager: false, // Mantenha false para performance, carregue sob demanda.
  })
  paystubs?: Paystub[];
}
