import { Router } from 'express';

import { createZonaSchema, updateZonaSchema } from './zonas.schema';
import { ZonasService } from './zonas.service';

export const zonasController = Router();

const service = new ZonasService();

// Obtener todas las zonas
zonasController.get('/', async (_, res) => {
  try {
    const zonas = await service.findAll();
    res.json(zonas);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Obtener una zona por ID
zonasController.get('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const zona = await service.findById(id);
    res.json(zona);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Obtener una zona por código
zonasController.get('/codigo/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const zona = await service.findByCodigo(codigo);
    res.json(zona);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Crear una nueva zona
zonasController.post('/', async (req, res) => {
  try {
    const dataValidation = createZonaSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        success: false,
        errors: dataValidation.error,
      });
    }

    const newZona = await service.create(dataValidation.data);
    res.status(201).json(newZona);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Actualizar una zona
zonasController.put('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const dataValidation = updateZonaSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        success: false,
        errors: dataValidation.error,
      });
    }

    const updatedZona = await service.update(id, dataValidation.data);
    res.json(updatedZona);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Eliminar una zona
zonasController.delete('/:id', async (req, res) => {
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
