import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmployesAndPaystubsTables1748142291676
  implements MigrationInterface
{
  name = 'CreateEmployesAndPaystubsTables1748142291676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."paystubs_competencia_cracha_idx"`,
    );
    await queryRunner.query(`DROP INDEX "public"."employes_cpf_cracha_idx"`);
    await queryRunner.query(`DROP INDEX "public"."employes_cpf_key"`);
    await queryRunner.query(
      `ALTER TABLE "paystubs" ALTER COLUMN "competencia" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "paystubs" ALTER COLUMN "dataadm" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "paystubs" ALTER COLUMN "datanasc" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "employes" ADD CONSTRAINT "UQ_5d95172842f10f1bafb951bed7a" UNIQUE ("cpf")`,
    );
    await queryRunner.query(
      `ALTER TABLE "employes" ALTER COLUMN "created_at" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "employes" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "employes" ALTER COLUMN "updated_at" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "employes" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f54f26afe9845d4d2402e5677" ON "paystubs" ("cpf") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5d95172842f10f1bafb951bed7" ON "employes" ("cpf") `,
    );
    // await queryRunner.query(`ALTER TABLE "paystubs" ADD CONSTRAINT "FK_5f54f26afe9845d4d2402e56779" FOREIGN KEY ("cpf") REFERENCES "employes"("cpf") ON DELETE SET NULL ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "paystubs" DROP CONSTRAINT "FK_5f54f26afe9845d4d2402e56779"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d95172842f10f1bafb951bed7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f54f26afe9845d4d2402e5677"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employes" ALTER COLUMN "updated_at" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "employes" ALTER COLUMN "updated_at" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "employes" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "employes" ALTER COLUMN "created_at" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "employes" DROP CONSTRAINT "UQ_5d95172842f10f1bafb951bed7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "paystubs" ALTER COLUMN "datanasc" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "paystubs" ALTER COLUMN "dataadm" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "paystubs" ALTER COLUMN "competencia" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "employes_cpf_key" ON "employes" ("cpf") `,
    );
    await queryRunner.query(
      `CREATE INDEX "employes_cpf_cracha_idx" ON "employes" ("cpf", "cracha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "paystubs_competencia_cracha_idx" ON "paystubs" ("competencia", "cracha") `,
    );
  }
}
