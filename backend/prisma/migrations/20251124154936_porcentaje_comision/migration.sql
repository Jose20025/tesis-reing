/*
  Warnings:

  - Added the required column `porcentaje_comision` to the `cobranzas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cobranzas` ADD COLUMN `porcentaje_comision` DOUBLE NOT NULL;
