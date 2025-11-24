/*
  Warnings:

  - A unique constraint covering the columns `[codigo,vendedor_id]` on the table `almacenes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo,vendedor_id]` on the table `billeteras` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `almacenes_codigo_key` ON `almacenes`;

-- DropIndex
DROP INDEX `billeteras_codigo_key` ON `billeteras`;

-- CreateIndex
CREATE UNIQUE INDEX `almacenes_codigo_vendedor_id_key` ON `almacenes`(`codigo`, `vendedor_id`);

-- CreateIndex
CREATE UNIQUE INDEX `billeteras_codigo_vendedor_id_key` ON `billeteras`(`codigo`, `vendedor_id`);
