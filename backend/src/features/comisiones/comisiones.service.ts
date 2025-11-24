import { prisma } from '@/src/db/prisma';
import { CustomHttpError } from '@/src/lib/error-handler';

import type { CreateComisionInput, UpdateComisionInput } from './comisiones.schema';

export class ComisionesService {
  async findAll() {
    const comisiones = await prisma.comision.findMany({
      orderBy: { codigo: 'asc' },
      include: {
        _count: {
          select: {
            vendedores: true,
          },
        },
      },
    });

    return comisiones;
  }

  async findById(id: number) {
    const comision = await prisma.comision.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            vendedores: true,
          },
        },
      },
    });

    if (!comision) {
      throw new CustomHttpError('Comisión no encontrada', 404);
    }

    return comision;
  }

  async findByCodigo(codigo: string) {
    const comision = await prisma.comision.findUnique({
      where: { codigo },
      include: {
        _count: {
          select: {
            vendedores: true,
          },
        },
      },
    });

    if (!comision) {
      throw new CustomHttpError('Comisión no encontrada', 404);
    }

    return comision;
  }

  async create(input: CreateComisionInput) {
    const existingComision = await prisma.comision.findUnique({
      where: { codigo: input.codigo },
    });

    if (existingComision) {
      throw new CustomHttpError('El código de comisión ya existe', 400);
    }

    // Validar que los períodos estén en orden ascendente
    if (input.periodo1 >= input.periodo2 || input.periodo2 >= input.periodo3) {
      throw new CustomHttpError('Los períodos deben estar en orden ascendente (periodo1 < periodo2 < periodo3)', 400);
    }

    const newComision = await prisma.comision.create({
      data: input,
    });

    return newComision;
  }

  async update(id: number, input: UpdateComisionInput) {
    const existingComision = await this.findById(id); // Verificar que existe

    // Si se está actualizando el código, verificar que no exista otra comisión con el mismo código
    if (input.codigo) {
      const conflictingComision = await prisma.comision.findUnique({
        where: { codigo: input.codigo },
      });

      if (conflictingComision && conflictingComision.id !== id) {
        throw new CustomHttpError('El código de comisión ya existe', 400);
      }
    }

    // Validar períodos si se están actualizando
    const finalPeriodo1 = input.periodo1 ?? existingComision.periodo1;
    const finalPeriodo2 = input.periodo2 ?? existingComision.periodo2;
    const finalPeriodo3 = input.periodo3 ?? existingComision.periodo3;

    if (finalPeriodo1 >= finalPeriodo2 || finalPeriodo2 >= finalPeriodo3) {
      throw new CustomHttpError('Los períodos deben estar en orden ascendente (periodo1 < periodo2 < periodo3)', 400);
    }

    const updatedComision = await prisma.comision.update({
      where: { id },
      data: input,
    });

    return updatedComision;
  }

  async delete(id: number) {
    await this.findById(id); // Verificar que existe

    // Verificar si tiene vendedores asociados
    const vendedoresCount = await prisma.vendedor.count({
      where: { comisionId: id },
    });

    if (vendedoresCount > 0) {
      throw new CustomHttpError('No se puede eliminar la comisión porque tiene vendedores asociados', 400);
    }

    await prisma.comision.delete({
      where: { id },
    });

    return { message: 'Comisión eliminada correctamente' };
  }

  async calculateComisionPorcentaje(comisionId: number, diasRetraso: number) {
    const comision = await this.findById(comisionId);

    if (diasRetraso <= comision.periodo1) {
      return comision.comision1;
    }
    else if (diasRetraso <= comision.periodo2) {
      return comision.comision2;
    }
    else if (diasRetraso <= comision.periodo3) {
      return comision.comision3;
    }
    else {
      return 0; // Sin comisión después del período 3
    }
  }
}
