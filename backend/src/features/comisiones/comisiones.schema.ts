import z from 'zod';

export const createComisionSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  periodo1: z.number().int().min(0, 'El período 1 debe ser mayor o igual a 0'),
  comision1: z.number().min(0, 'La comisión 1 debe ser mayor o igual a 0').max(100, 'La comisión 1 no puede ser mayor a 100%'),
  periodo2: z.number().int().min(0, 'El período 2 debe ser mayor o igual a 0'),
  comision2: z.number().min(0, 'La comisión 2 debe ser mayor o igual a 0').max(100, 'La comisión 2 no puede ser mayor a 100%'),
  periodo3: z.number().int().min(0, 'El período 3 debe ser mayor o igual a 0'),
  comision3: z.number().min(0, 'La comisión 3 debe ser mayor o igual a 0').max(100, 'La comisión 3 no puede ser mayor a 100%'),
});

export const updateComisionSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio').optional(),
  descripcion: z.string().min(1, 'La descripción es obligatoria').optional(),
  periodo1: z.number().int().min(0, 'El período 1 debe ser mayor o igual a 0').optional(),
  comision1: z.number().min(0, 'La comisión 1 debe ser mayor o igual a 0').max(100, 'La comisión 1 no puede ser mayor a 100%').optional(),
  periodo2: z.number().int().min(0, 'El período 2 debe ser mayor o igual a 0').optional(),
  comision2: z.number().min(0, 'La comisión 2 debe ser mayor o igual a 0').max(100, 'La comisión 2 no puede ser mayor a 100%').optional(),
  periodo3: z.number().int().min(0, 'El período 3 debe ser mayor o igual a 0').optional(),
  comision3: z.number().min(0, 'La comisión 3 debe ser mayor o igual a 0').max(100, 'La comisión 3 no puede ser mayor a 100%').optional(),
});

export type CreateComisionInput = z.infer<typeof createComisionSchema>;
export type UpdateComisionInput = z.infer<typeof updateComisionSchema>;