import { Router } from 'express';

import { periodoSchema } from './reportes.schema';
import { ReportesAdministradorService, ReportesVendedorService } from './reportes.service';

export const reportesController = Router();

const vendedorService = new ReportesVendedorService();
const administradorService = new ReportesAdministradorService();

reportesController.get('/mis-ventas/:vendedorId', async (req, res) => {
  const vendedorId = Number.parseInt(req.params.vendedorId);

  if (Number.isNaN(vendedorId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de vendedor inválido',
    });
  }

  const periodosValidation = periodoSchema.safeParse(req.query);

  if (!periodosValidation.success) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros de periodo inválidos',
      errors: periodosValidation.error,
    });
  }

  const reporte = await vendedorService.generarMisVentasReporte(vendedorId, periodosValidation.data);

  res.setHeader('Content-Type', 'application/pdf');

  reporte.pipe(res);
  reporte.end();
});

reportesController.get('/mis-cobranzas/:vendedorId', async (req, res) => {
  const vendedorId = Number.parseInt(req.params.vendedorId);

  if (Number.isNaN(vendedorId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de vendedor inválido',
    });
  }

  const periodosValidation = periodoSchema.safeParse(req.query);

  if (!periodosValidation.success) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros de periodo inválidos',
      errors: periodosValidation.error,
    });
  }

  const reporte = await vendedorService.generarMisCobranzasReporte(vendedorId, periodosValidation.data);

  res.setHeader('Content-Type', 'application/pdf');

  reporte.pipe(res);
  reporte.end();
});

reportesController.get('/consolidado/ventas', async (req, res) => {
  const periodosValidation = periodoSchema.safeParse(req.query);

  if (!periodosValidation.success) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros de periodo inválidos',
      errors: periodosValidation.error,
    });
  }

  const reporte = await administradorService.generarConsolidadoVentasReporte(periodosValidation.data);

  res.setHeader('Content-Type', 'application/pdf');

  reporte.pipe(res);
  reporte.end();
});

reportesController.get('/consolidado/cobranzas', async (req, res) => {
  const periodosValidation = periodoSchema.safeParse(req.query);

  if (!periodosValidation.success) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros de periodo inválidos',
      errors: periodosValidation.error,
    });
  }

  const reporte = await administradorService.generarConsolidadoCobranzasReporte(periodosValidation.data);

  res.setHeader('Content-Type', 'application/pdf');

  reporte.pipe(res);
  reporte.end();
});
