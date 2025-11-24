import z from 'zod';

export const createMarcaProductoSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
});

export const updateMarcaProductoSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio').optional(),
  descripcion: z.string().min(1, 'La descripción es obligatoria').optional(),
});

export type CreateMarcaProductoInput = z.infer<typeof createMarcaProductoSchema>;
export type UpdateMarcaProductoInput = z.infer<typeof updateMarcaProductoSchema>;