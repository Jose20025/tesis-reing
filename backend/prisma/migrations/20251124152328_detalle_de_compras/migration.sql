-- CreateTable
CREATE TABLE `detalle_compra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `compra_id` INTEGER NOT NULL,
    `almacen_id` INTEGER NOT NULL,
    `producto_id` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `costo_unitario` DOUBLE NOT NULL,
    `lote_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;

-- AddForeignKey
ALTER TABLE `detalle_compra` ADD CONSTRAINT `detalle_compra_compra_id_fkey` FOREIGN KEY (`compra_id`) REFERENCES `compras`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_compra` ADD CONSTRAINT `detalle_compra_almacen_id_fkey` FOREIGN KEY (`almacen_id`) REFERENCES `almacenes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_compra` ADD CONSTRAINT `detalle_compra_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_compra` ADD CONSTRAINT `detalle_compra_lote_id_fkey` FOREIGN KEY (`lote_id`) REFERENCES `lotes_producto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
