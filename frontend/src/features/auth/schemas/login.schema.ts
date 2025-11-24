import z from 'zod';

export const loginSchema = z.object({
  username: z
    .string({ error: 'El usuario es requerido' })
    .nonempty({ error: 'El usuario es requerido' }),
  password: z
    .string({ error: 'La contraseña es requerida' })
    .nonempty({ error: 'La contraseña es requerida' }),
});
export type LoginSchema = z.infer<typeof loginSchema>;
