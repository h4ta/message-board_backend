import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1731461902575 implements MigrationInterface {
    name = 'InitialSchema1731461902575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "micro_post" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "content" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_aa8a29af771579d6f0d126b61b0" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "micro_post"`);
    }

}
