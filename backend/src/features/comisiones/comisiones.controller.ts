import { Router } from 'express';

import { createComisionSchema, updateComisionSchema } from './comisiones.schema';
import { ComisionesService } from './comisiones.service';

export const comisionesController = Router();

const service = new ComisionesService();

// Obtener todas las comisiones
comisionesController.get('/', async (_, res) => {
  try {
    const comisiones = await service.findAll();
    res.json(comisiones);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Obtener una comisión por ID
comisionesController.get('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const comision = await service.findById(id);
    res.json(comision);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Obtener una comisión por código
comisionesController.get('/codigo/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const comision = await service.findByCodigo(codigo);
    res.json(comision);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Calcular porcentaje de comisión basado en días de retraso
comisionesController.get('/:id/calcular/:diasRetraso', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);
    const diasRetraso = Number.parseInt(req.params.diasRetraso);

    if (Number.isNaN(id) || Number.isNaN(diasRetraso)) {
      return res.status(400).json({
        success: false,
        message: 'ID o días de retraso inválidos',
      });
    }

    if (diasRetraso < 0) {
      return res.status(400).json({
        success: false,
        message: 'Los días de retraso no pueden ser negativos',
      });
    }

    const porcentaje = await service.calculateComisionPorcentaje(id, diasRetraso);
    res.json({
      comisionId: id,
      diasRetraso,
      porcentajeComision: porcentaje,
    });
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Crear una nueva comisión
comisionesController.post('/', async (req, res) => {
  try {
    const dataValidation = createComisionSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        success: false,
        errors: dataValidation.error,
      });
    }

    const newComision = await service.create(dataValidation.data);
    res.status(201).json(newComision);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Actualizar una comisión
comisionesController.put('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const dataValidation = updateComisionSchema.safeParse(req.body);

    if (!dataValidation.success) {
      return res.status(400).json({
        success: false,
        errors: dataValidation.error,
      });
    }

    const updatedComision = await service.update(id, dataValidation.data);
    res.json(updatedComision);
  }
  catch (error) {
    res.status(error instanceof Error && 'status' in error ? (error as any).status : 500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
});

// Eliminar una comisión
comisionesController.delete('/:id', async (req, res) => {
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
