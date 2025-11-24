import z from 'zod';

export const createProveedorSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  telefono: z.string().optional(),
});

export const updateProveedorSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio').optional(),
  nombre: z.string().min(1, 'El nombre es obligatorio').optional(),
  telefono: z.string().optional(),
});

export type CreateProveedorInput = z.infer<typeof createProveedorSchema>;
export type UpdateProveedorInput = z.infer<typeof updateProveedorSchema>;