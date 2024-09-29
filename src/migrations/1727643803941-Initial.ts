import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1727643803941 implements MigrationInterface {
    name = 'Initial1727643803941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pessoa" ("id" SERIAL NOT NULL, "nome" character varying(100) NOT NULL, "documento" character varying(14) NOT NULL, "cep" character varying(10) NOT NULL, "endereco" character varying NOT NULL, "telefone" character varying(14) NOT NULL, "ativo" boolean NOT NULL, CONSTRAINT "pk_pessoa" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "pessoa"`);
    }

}
