import z from 'zod';

export enum MonedaEnum {
  BOLIVIANOS = 'BOLIVIANOS',
  DOLARES = 'DOLARES',
}

export const createBilleteraSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  moneda: z.enum(MonedaEnum, {
    error: 'El tipo de moneda es obligatorio y debe ser BOLIVIANOS o DOLARES',
  }),
  vendedorId: z.number().int().positive('El ID del vendedor debe ser un número positivo'),
});

export const updateBilleteraSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio').optional(),
  descripcion: z.string().min(1, 'La descripción es obligatoria').optional(),
  moneda: z.enum(MonedaEnum, {
    error: 'El tipo de moneda es obligatorio y debe ser BOLIVIANOS o DOLARES',
  }).optional(),
  vendedorId: z.number().int().positive('El ID del vendedor debe ser un número positivo').optional(),
});

export type CreateBilleteraInput = z.infer<typeof createBilleteraSchema>;
export type UpdateBilleteraInput = z.infer<typeof updateBilleteraSchema>;
