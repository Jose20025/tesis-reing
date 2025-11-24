-- DropForeignKey
ALTER TABLE `pagos` DROP FOREIGN KEY `pagos_venta_id_fkey`;

-- DropIndex
DROP INDEX `pagos_venta_id_fkey` ON `pagos`;

-- AlterTable
ALTER TABLE `pagos` ADD COLUMN `compra_id` INTEGER NULL,
    MODIFY `venta_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_venta_id_fkey` FOREIGN KEY (`venta_id`) REFERENCES `ventas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_compra_id_fkey` FOREIGN KEY (`compra_id`) REFERENCES `compras`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
