/*
  Warnings:

  - Added the required column `comision_id` to the `vendedores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vendedores` ADD COLUMN `comision_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `comisiones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `periodo_1` INTEGER NOT NULL,
    `comision_1` DOUBLE NOT NULL,
    `periodo_2` INTEGER NOT NULL,
    `comision_2` DOUBLE NOT NULL,
    `periodo_3` INTEGER NOT NULL,
    `comision_3` DOUBLE NOT NULL,

    UNIQUE INDEX `comisiones_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `vendedores` ADD CONSTRAINT `vendedores_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
