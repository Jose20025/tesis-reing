import { Router } from 'express';

import { createBilleteraSchema, updateBilleteraSchema } from './billeteras.schema';
import { BilleterasService } from './billeteras.service';

export const billeterasController = Router();

const service = new BilleterasService();

// Obtener todas las billeteras
billeterasController.get('/', async (_, res) => {
  try {
    const billeteras = await service.findAll();
    res.json(billeteras);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Obtener billeteras por vendedor
billeterasController.get('/vendedor/:vendedorId', async (req, res) => {
  try {
    const vendedorId = Number.parseInt(req.params.vendedorId);

    if (Number.isNaN(vendedorId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de vendedor inválido',
      });
    }

    const billeteras = await service.findByVendedorId(vendedorId);
    res.json(billeteras);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Obtener una billetera por ID
billeterasController.get('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const billetera = await service.findById(id);
    res.json(billetera);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Crear una nueva billetera
billeterasController.post('/', async (req, res) => {
  try {
    const dataValidation = createBilleteraSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        success: false,
        errors: dataValidation.error,
      });
    }

    const newBilletera = await service.create(dataValidation.data);
    res.status(201).json(newBilletera);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Actualizar una billetera
billeterasController.put('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const dataValidation = updateBilleteraSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        success: false,
        errors: dataValidation.error,
      });
    }

    const updatedBilletera = await service.update(id, dataValidation.data);
    res.json(updatedBilletera);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Eliminar una billetera
billeterasController.delete('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const result = await service.delete(id);
    res.json(result);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});
