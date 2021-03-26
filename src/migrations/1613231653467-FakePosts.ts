import { MigrationInterface, QueryRunner } from "typeorm";

export class FakePosts1613231653478 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<void> {}

  public async down(_: QueryRunner): Promise<void> {}
}
