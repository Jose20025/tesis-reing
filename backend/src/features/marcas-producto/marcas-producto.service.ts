import { prisma } from '@/src/db/prisma';
import { CustomHttpError } from '@/src/lib/error-handler';

import type { CreateMarcaProductoInput, UpdateMarcaProductoInput } from './marcas-producto.schema';

export class MarcasProductoService {
  async findAll() {
    const marcas = await prisma.marcaProducto.findMany({
      orderBy: { codigo: 'asc' },
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    return marcas;
  }

  async findById(id: number) {
    const marca = await prisma.marcaProducto.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    if (!marca) {
      throw new CustomHttpError('Marca de producto no encontrada', 404);
    }

    return marca;
  }

  async findByCodigo(codigo: string) {
    const marca = await prisma.marcaProducto.findUnique({
      where: { codigo },
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    if (!marca) {
      throw new CustomHttpError('Marca de producto no encontrada', 404);
    }

    return marca;
  }

  async create(input: CreateMarcaProductoInput) {
    const existingMarca = await prisma.marcaProducto.findUnique({
      where: { codigo: input.codigo },
    });

    if (existingMarca) {
      throw new CustomHttpError('El código de marca ya existe', 400);
    }

    const newMarca = await prisma.marcaProducto.create({
      data: input,
    });

    return newMarca;
  }

  async update(id: number, input: UpdateMarcaProductoInput) {
    await this.findById(id); // Verificar que existe

    // Si se está actualizando el código, verificar que no exista otra marca con el mismo código
    if (input.codigo) {
      const existingMarca = await prisma.marcaProducto.findUnique({
        where: { codigo: input.codigo },
      });

      if (existingMarca && existingMarca.id !== id) {
        throw new CustomHttpError('El código de marca ya existe', 400);
      }
    }

    const updatedMarca = await prisma.marcaProducto.update({
      where: { id },
      data: input,
    });

    return updatedMarca;
  }

  async delete(id: number) {
    await this.findById(id); // Verificar que existe

    // Verificar si tiene productos asociados
    const productosCount = await prisma.producto.count({
      where: { marcaId: id },
    });

    if (productosCount > 0) {
      throw new CustomHttpError('No se puede eliminar la marca porque tiene productos asociados', 400);
    }

    await prisma.marcaProducto.delete({
      where: { id },
    });

    return { message: 'Marca de producto eliminada correctamente' };
  }
}
