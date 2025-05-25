import { MigrationInterface, QueryRunner } from 'typeorm'; // Adicione TableIndex se usar queryRunner.createIndex

export class AddUniqueConstraintToCrachaEmployes1748203881937
  implements MigrationInterface
{
  name = 'AddUniqueConstraintToCrachaEmployes1748203881937';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Se você tem @Index({ unique: true }) e @Column({ unique: true }) na entidade,
    // o TypeORM pode tentar criar a constraint E o índice.
    // A constraint UNIQUE geralmente é suficiente e cria seu próprio índice.

    // Adicionar a constraint (geralmente cria um índice automaticamente)
    await queryRunner.query(
      `ALTER TABLE "employes" ADD CONSTRAINT "UQ_employes_cracha" UNIQUE ("cracha")`,
    );

    // Se o TypeORM gerou a linha CREATE UNIQUE INDEX "IDX_5c7efc28c05aeb30a481f1ae49"
    // e o DROP INDEX correspondente, é provável que ele espere que esse índice
    // com esse nome específico exista para ser dropado no 'down'.
    // Tente manter as duas queries do 'up' original se o 'down' referencia o índice pelo nome gerado.
    // A ordem pode importar.
    // await queryRunner.query(
    //   `CREATE UNIQUE INDEX "IDX_5c7efc28c05aeb30a481f1ae49" ON "employes" ("cracha") `,
    // );
    // OU se o TypeORM gerou via TableIndex (mais provável se @Index foi usado):
    // Esta é a forma como o TypeORM normalmente cria índices de forma mais abstrata.
    // Verifique o arquivo original gerado antes de você remover a linha da FK.
    // Se ele usou queryRunner.createIndex, use isso. Se usou query raw, use a query raw.

    // Se o arquivo original gerado antes de suas edições tinha:
    // await queryRunner.createIndex("employes", new TableIndex({ name: "IDX_5c7efc28c05aeb30a481f1ae49", columnNames: ["cracha"], isUnique: true }));
    // Então o 'up' deveria ter isso, e o 'down' teria:
    // await queryRunner.dropIndex("employes", "IDX_5c7efc28c05aeb30a481f1ae49");

    // Vamos manter o que você tem no UP por enquanto, pois o DOWN referencia esses nomes.
    await queryRunner.query(
      `ALTER TABLE "employes" ADD CONSTRAINT "UQ_5c7efc28c05aeb30a481f1ae493" UNIQUE ("cracha")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5c7efc28c05aeb30a481f1ae49" ON "employes" ("cracha") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // O 'down' deve reverter as operações do 'up' na ordem inversa.
    // Se o 'up' fez CREATE INDEX e depois ADD CONSTRAINT,
    // o 'down' faz DROP CONSTRAINT e depois DROP INDEX.
    // Se o 'up' fez ADD CONSTRAINT e depois CREATE INDEX (como no seu 'up' atual):

    await queryRunner.query(
      `DROP INDEX "public"."IDX_5c7efc28c05aeb30a481f1ae49"`, // Corresponde ao CREATE UNIQUE INDEX
    );
    await queryRunner.query(
      `ALTER TABLE "employes" DROP CONSTRAINT "UQ_5c7efc28c05aeb30a481f1ae493"`, // Corresponde ao ADD CONSTRAINT
    );
  }
}
