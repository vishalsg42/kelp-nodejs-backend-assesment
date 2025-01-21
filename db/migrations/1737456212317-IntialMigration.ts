import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntialMigration1737456212317 implements MigrationInterface {
  name = 'IntialMigration1737456212317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_e78774d95a5d698bb248e1c7d2" ON "users" ("age") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e78774d95a5d698bb248e1c7d2"`,
    );
  }
}
