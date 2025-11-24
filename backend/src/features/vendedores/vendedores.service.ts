import { prisma } from '@/src/db/prisma';
import { CustomHttpError } from '@/src/lib/error-handler';

import type { CreateVendedorInput } from './vendedores.schema';

export class VendedoresService {
  async findAll() {
    const vendedores = await prisma.vendedor.findMany({
      orderBy: { codigo: 'asc' },
    });

    return vendedores;
  }

  async findByCodigo(codigo: string) {
    const vendedor = await prisma.vendedor.findUnique({
      where: { codigo },
    });

    if (!vendedor) {
      throw new CustomHttpError('Vendedor no encontrado', 404);
    }

    return vendedor;
  }

  async create(input: CreateVendedorInput) {
    const existingVendedor = await prisma.vendedor.findUnique({
      where: { codigo: input.codigo },
    });

    if (existingVendedor) {
      throw new CustomHttpError('El código de vendedor ya existe', 400);
    }

    const newVendedor = await prisma.vendedor.create({
      data: input,
    });

    return newVendedor;
  }
}
