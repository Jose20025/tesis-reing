/*
  Warnings:

  - Made the column `direccion` on table `clientes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telefono` on table `clientes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `clientes` MODIFY `direccion` VARCHAR(191) NOT NULL,
    MODIFY `telefono` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `productos` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `vendedores` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
