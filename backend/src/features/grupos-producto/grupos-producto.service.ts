import { prisma } from '@/src/db/prisma';
import { CustomHttpError } from '@/src/lib/error-handler';

import type { CreateGrupoProductoInput, UpdateGrupoProductoInput } from './grupos-producto.schema';

export class GruposProductoService {
  async findAll() {
    const grupos = await prisma.grupoProducto.findMany({
      orderBy: { codigo: 'asc' },
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    return grupos;
  }

  async findById(id: number) {
    const grupo = await prisma.grupoProducto.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    if (!grupo) {
      throw new CustomHttpError('Grupo de producto no encontrado', 404);
    }

    return grupo;
  }

  async findByCodigo(codigo: string) {
    const grupo = await prisma.grupoProducto.findUnique({
      where: { codigo },
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    if (!grupo) {
      throw new CustomHttpError('Grupo de producto no encontrado', 404);
    }

    return grupo;
  }

  async create(input: CreateGrupoProductoInput) {
    const existingGrupo = await prisma.grupoProducto.findUnique({
      where: { codigo: input.codigo },
    });

    if (existingGrupo) {
      throw new CustomHttpError('El código de grupo ya existe', 400);
    }

    const newGrupo = await prisma.grupoProducto.create({
      data: input,
    });

    return newGrupo;
  }

  async update(id: number, input: UpdateGrupoProductoInput) {
    await this.findById(id); // Verificar que existe

    // Si se está actualizando el código, verificar que no exista otro grupo con el mismo código
    if (input.codigo) {
      const existingGrupo = await prisma.grupoProducto.findUnique({
        where: { codigo: input.codigo },
      });

      if (existingGrupo && existingGrupo.id !== id) {
        throw new CustomHttpError('El código de grupo ya existe', 400);
      }
    }

    const updatedGrupo = await prisma.grupoProducto.update({
      where: { id },
      data: input,
    });

    return updatedGrupo;
  }

  async delete(id: number) {
    await this.findById(id); // Verificar que existe

    // Verificar si tiene productos asociados
    const productosCount = await prisma.producto.count({
      where: { grupoId: id },
    });

    if (productosCount > 0) {
      throw new CustomHttpError('No se puede eliminar el grupo porque tiene productos asociados', 400);
    }

    await prisma.grupoProducto.delete({
      where: { id },
    });

    return { message: 'Grupo de producto eliminado correctamente' };
  }
}
