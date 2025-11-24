import { prisma } from '@/src/db/prisma';
import { CustomHttpError } from '@/src/lib/error-handler';

import type { CreateZonaInput, UpdateZonaInput } from './zonas.schema';

export class ZonasService {
  async findAll() {
    const zonas = await prisma.zona.findMany({
      orderBy: { codigo: 'asc' },
      include: {
        _count: {
          select: {
            clientes: true,
          },
        },
      },
    });

    return zonas;
  }

  async findById(id: number) {
    const zona = await prisma.zona.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clientes: true,
          },
        },
      },
    });

    if (!zona) {
      throw new CustomHttpError('Zona no encontrada', 404);
    }

    return zona;
  }

  async findByCodigo(codigo: string) {
    const zona = await prisma.zona.findUnique({
      where: { codigo },
      include: {
        _count: {
          select: {
            clientes: true,
          },
        },
      },
    });

    if (!zona) {
      throw new CustomHttpError('Zona no encontrada', 404);
    }

    return zona;
  }

  async create(input: CreateZonaInput) {
    const existingZona = await prisma.zona.findUnique({
      where: { codigo: input.codigo },
    });

    if (existingZona) {
      throw new CustomHttpError('El código de zona ya existe', 400);
    }

    const newZona = await prisma.zona.create({
      data: input,
    });

    return newZona;
  }

  async update(id: number, input: UpdateZonaInput) {
    await this.findById(id); // Verificar que existe

    // Si se está actualizando el código, verificar que no exista otra zona con el mismo código
    if (input.codigo) {
      const existingZona = await prisma.zona.findUnique({
        where: { codigo: input.codigo },
      });

      if (existingZona && existingZona.id !== id) {
        throw new CustomHttpError('El código de zona ya existe', 400);
      }
    }

    const updatedZona = await prisma.zona.update({
      where: { id },
      data: input,
    });

    return updatedZona;
  }

  async delete(id: number) {
    await this.findById(id); // Verificar que existe

    // Verificar si tiene clientes asociados
    const clientesCount = await prisma.cliente.count({
      where: { zonaId: id },
    });

    if (clientesCount > 0) {
      throw new CustomHttpError('No se puede eliminar la zona porque tiene clientes asociados', 400);
    }

    await prisma.zona.delete({
      where: { id },
    });

    return { message: 'Zona eliminada correctamente' };
  }
}
