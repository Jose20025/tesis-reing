import z from 'zod';

export const createGrupoProductoSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
});

export const updateGrupoProductoSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio').optional(),
  descripcion: z.string().min(1, 'La descripción es obligatoria').optional(),
});

export type CreateGrupoProductoInput = z.infer<typeof createGrupoProductoSchema>;
export type UpdateGrupoProductoInput = z.infer<typeof updateGrupoProductoSchema>;