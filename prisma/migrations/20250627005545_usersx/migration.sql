/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `bairro` VARCHAR(100) NULL,
    ADD COLUMN `cargo` VARCHAR(100) NULL,
    ADD COLUMN `cep` VARCHAR(10) NULL,
    ADD COLUMN `cidade` VARCHAR(100) NULL,
    ADD COLUMN `complemento` VARCHAR(100) NULL,
    ADD COLUMN `cpf` VARCHAR(14) NOT NULL,
    ADD COLUMN `criadoPor` INTEGER NULL,
    ADD COLUMN `endereco` VARCHAR(255) NULL,
    ADD COLUMN `estado` VARCHAR(2) NULL,
    ADD COLUMN `modulosLiberados` JSON NOT NULL,
    ADD COLUMN `numero` VARCHAR(20) NULL,
    ADD COLUMN `observacoes` TEXT NULL,
    ADD COLUMN `status` ENUM('ATIVO', 'INATIVO', 'SUSPENSO') NOT NULL DEFAULT 'ATIVO',
    ADD COLUMN `telefone` VARCHAR(20) NULL,
    ADD COLUMN `username` VARCHAR(100) NOT NULL,
    ADD COLUMN `viewsLiberadas` JSON NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `users_cpf_key` ON `users`(`cpf`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_criadoPor_fkey` FOREIGN KEY (`criadoPor`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
