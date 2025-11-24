import { prisma } from '@/src/db/prisma';
import { CustomHttpError } from '@/src/lib/error-handler';

import type { CreateProveedorInput, UpdateProveedorInput } from './proveedores.schema';

export class ProveedoresService {
  async findAll() {
    const proveedores = await prisma.proveedor.findMany({
      orderBy: { codigo: 'asc' },
    });

    return proveedores;
  }

  async findById(id: number) {
    const proveedor = await prisma.proveedor.findUnique({
      where: { id },
    });

    if (!proveedor) {
      throw new CustomHttpError('Proveedor no encontrado', 404);
    }

    return proveedor;
  }

  async findByCodigo(codigo: string) {
    const proveedor = await prisma.proveedor.findUnique({
      where: { codigo },
    });

    if (!proveedor) {
      throw new CustomHttpError('Proveedor no encontrado', 404);
    }

    return proveedor;
  }

  async create(input: CreateProveedorInput) {
    const existingProveedor = await prisma.proveedor.findUnique({
      where: { codigo: input.codigo },
    });

    if (existingProveedor) {
      throw new CustomHttpError('El código de proveedor ya existe', 400);
    }

    const newProveedor = await prisma.proveedor.create({
      data: input,
    });

    return newProveedor;
  }

  async update(id: number, input: UpdateProveedorInput) {
    await this.findById(id); // Verificar que existe

    // Si se está actualizando el código, verificar que no exista otro proveedor con el mismo código
    if (input.codigo) {
      const existingProveedor = await prisma.proveedor.findUnique({
        where: { codigo: input.codigo },
      });

      if (existingProveedor && existingProveedor.id !== id) {
        throw new CustomHttpError('El código de proveedor ya existe', 400);
      }
    }

    const updatedProveedor = await prisma.proveedor.update({
      where: { id },
      data: input,
    });

    return updatedProveedor;
  }

  async delete(id: number) {
    await this.findById(id); // Verificar que existe

    // Verificar si tiene compras asociadas
    const comprasCount = await prisma.compra.count({
      where: { proveedorId: id },
    });

    if (comprasCount > 0) {
      throw new CustomHttpError('No se puede eliminar el proveedor porque tiene compras asociadas', 400);
    }

    await prisma.proveedor.delete({
      where: { id },
    });

    return { message: 'Proveedor eliminado correctamente' };
  }
}
