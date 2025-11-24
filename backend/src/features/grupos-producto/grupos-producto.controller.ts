import { Router } from 'express';

import { createGrupoProductoSchema, updateGrupoProductoSchema } from './grupos-producto.schema';
import { GruposProductoService } from './grupos-producto.service';

export const gruposProductoController = Router();

const service = new GruposProductoService();

// Obtener todos los grupos de producto
gruposProductoController.get('/', async (_, res) => {
  try {
    const grupos = await service.findAll();
    res.json(grupos);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Obtener un grupo de producto por ID
gruposProductoController.get('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const grupo = await service.findById(id);
    res.json(grupo);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Obtener un grupo de producto por código
gruposProductoController.get('/codigo/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const grupo = await service.findByCodigo(codigo);
    res.json(grupo);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Crear un nuevo grupo de producto
gruposProductoController.post('/', async (req, res) => {
  try {
    const dataValidation = createGrupoProductoSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        success: false,
        errors: dataValidation.error,
      });
    }

    const newGrupo = await service.create(dataValidation.data);
    res.status(201).json(newGrupo);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Actualizar un grupo de producto
gruposProductoController.put('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const dataValidation = updateGrupoProductoSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        success: false,
        errors: dataValidation.error,
      });
    }

    const updatedGrupo = await service.update(id, dataValidation.data);
    res.json(updatedGrupo);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Eliminar un grupo de producto
gruposProductoController.delete('/:id', async (req, res) => {
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
