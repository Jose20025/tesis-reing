import { Router } from 'express';

import { createProveedorSchema, updateProveedorSchema } from './proveedores.schema';
import { ProveedoresService } from './proveedores.service';

export const proveedoresController = Router();

const service = new ProveedoresService();

// Obtener todos los proveedores
proveedoresController.get('/', async (_, res) => {
  try {
    const proveedores = await service.findAll();
    res.json(proveedores);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Obtener un proveedor por ID
proveedoresController.get('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const proveedor = await service.findById(id);
    res.json(proveedor);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Obtener un proveedor por código
proveedoresController.get('/codigo/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const proveedor = await service.findByCodigo(codigo);
    res.json(proveedor);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Crear un nuevo proveedor
proveedoresController.post('/', async (req, res) => {
  try {
    const dataValidation = createProveedorSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        success: false,
        errors: dataValidation.error,
      });
    }

    const newProveedor = await service.create(dataValidation.data);
    res.status(201).json(newProveedor);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Actualizar un proveedor
proveedoresController.put('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const dataValidation = updateProveedorSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        success: false,
        errors: dataValidation.error,
      });
    }

    const updatedProveedor = await service.update(id, dataValidation.data);
    res.json(updatedProveedor);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Eliminar un proveedor
proveedoresController.delete('/:id', async (req, res) => {
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
