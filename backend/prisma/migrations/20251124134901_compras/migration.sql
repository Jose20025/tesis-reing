/*
  Warnings:

  - Added the required column `id_correlativo` to the `ventas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ventas` ADD COLUMN `id_correlativo` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `proveedores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,

    UNIQUE INDEX `proveedores_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- CreateTable
CREATE TABLE `compras` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_correlativo` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `proveedor_id` INTEGER NOT NULL,
    `vendedor_id` INTEGER NOT NULL,
    `total` DOUBLE NOT NULL,
    `descuento` DOUBLE NOT NULL DEFAULT 0,
    `neto` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_vendedor_id_fkey` FOREIGN KEY (`vendedor_id`) REFERENCES `vendedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
