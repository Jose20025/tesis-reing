import { prisma } from '@/src/db/prisma';
import { CustomHttpError } from '@/src/lib/error-handler';

import type { CreateBilleteraInput, UpdateBilleteraInput } from './billeteras.schema';

export class BilleterasService {
  async findAll() {
    const billeteras = await prisma.billetera.findMany({
      orderBy: { codigo: 'asc' },
      include: {
        vendedor: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
      },
    });

    return billeteras;
  }

  async findById(id: number) {
    const billetera = await prisma.billetera.findUnique({
      where: { id },
      include: {
        vendedor: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
      },
    });

    if (!billetera) {
      throw new CustomHttpError('Billetera no encontrada', 404);
    }

    return billetera;
  }

  async findByVendedorId(vendedorId: number) {
    const billeteras = await prisma.billetera.findMany({
      where: { vendedorId },
      orderBy: { codigo: 'asc' },
    });

    return billeteras;
  }

  async create(input: CreateBilleteraInput) {
    // Verificar que el vendedor existe
    const vendedor = await prisma.vendedor.findUnique({
      where: { id: input.vendedorId },
    });

    if (!vendedor) {
      throw new CustomHttpError('Vendedor no encontrado', 404);
    }

    // Verificar que no exista una billetera con el mismo código para el mismo vendedor
    const existingBilletera = await prisma.billetera.findFirst({
      where: {
        codigo: input.codigo,
        vendedorId: input.vendedorId,
      },
    });

    if (existingBilletera) {
      throw new CustomHttpError('Ya existe una billetera con este código para este vendedor', 400);
    }

    const newBilletera = await prisma.billetera.create({
      data: input,
      include: {
        vendedor: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
      },
    });

    return newBilletera;
  }

  async update(id: number, input: UpdateBilleteraInput) {
    const existingBilletera = await this.findById(id);

    // Si se está actualizando el código o vendedorId, verificar unicidad
    if (input.codigo || input.vendedorId) {
      const vendedorId = input.vendedorId || existingBilletera.vendedorId;
      const codigo = input.codigo || existingBilletera.codigo;

      const conflictingBilletera = await prisma.billetera.findFirst({
        where: {
          codigo,
          vendedorId,
          NOT: { id },
        },
      });

      if (conflictingBilletera) {
        throw new CustomHttpError('Ya existe una billetera con este código para este vendedor', 400);
      }
    }

    // Si se está actualizando el vendedorId, verificar que existe
    if (input.vendedorId) {
      const vendedor = await prisma.vendedor.findUnique({
        where: { id: input.vendedorId },
      });

      if (!vendedor) {
        throw new CustomHttpError('Vendedor no encontrado', 404);
      }
    }

    const updatedBilletera = await prisma.billetera.update({
      where: { id },
      data: input,
      include: {
        vendedor: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
      },
    });

    return updatedBilletera;
  }

  async delete(id: number) {
    await this.findById(id); // Verificar que existe

    // Verificar si tiene cobranzas asociadas
    const cobranzasCount = await prisma.cobranza.count({
      where: { billeteraId: id },
    });

    if (cobranzasCount > 0) {
      throw new CustomHttpError('No se puede eliminar la billetera porque tiene cobranzas asociadas', 400);
    }

    await prisma.billetera.delete({
      where: { id },
    });

    return { message: 'Billetera eliminada correctamente' };
  }
}
