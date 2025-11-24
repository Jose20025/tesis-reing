import z from 'zod';

export const createVendedorSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  isActivo: z.boolean().optional().default(true),
  comisionId: z.number(),
});
export type CreateVendedorInput = z.infer<typeof createVendedorSchema>;
