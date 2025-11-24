import z from 'zod';

export const createZonaSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  ciudad: z.string().min(1, 'La ciudad es obligatoria'),
});

export const updateZonaSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio').optional(),
  nombre: z.string().min(1, 'El nombre es obligatorio').optional(),
  ciudad: z.string().min(1, 'La ciudad es obligatoria').optional(),
});

export type CreateZonaInput = z.infer<typeof createZonaSchema>;
export type UpdateZonaInput = z.infer<typeof updateZonaSchema>;