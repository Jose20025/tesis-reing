import { Router } from 'express';

import { createVendedorSchema } from './vendedores.schema';
import { VendedoresService } from './vendedores.service';

export const vendedoresController = Router();

const service = new VendedoresService();

// Obtener todos los vendedores
vendedoresController.get('/', async (_, res) => {
  const vendedores = await service.findAll();

  res.json(vendedores);
});

// Obtener un vendedor por código
vendedoresController.get('/:codigo', async (req, res) => {
  const { codigo } = req.params;

  const vendedor = await service.findByCodigo(codigo);

  res.json(vendedor);
});

// Crear un nuevo vendedor
vendedoresController.post('/', async (req, res) => {
  const dataValidation = createVendedorSchema.safeParse(req.body);

  if (!dataValidation.success) {
    return res.status(400).json({
      success: false,
      errors: dataValidation.error,
    });
  }

  const newVendedor = await service.create(dataValidation.data);

  res.status(201).json(newVendedor);
});
