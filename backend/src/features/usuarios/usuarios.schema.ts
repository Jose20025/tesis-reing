import z from 'zod';

export enum TipoUsuarioEnum {
  VENDEDOR = 'VENDEDOR',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

export const createUsuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  username: z.string().min(1, 'El username es obligatorio'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
  vendedorId: z.number().optional(),
  isActivo: z.boolean().optional().default(true),
  tipo: z.enum(TipoUsuarioEnum).optional().default(TipoUsuarioEnum.VENDEDOR),
});
export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;

export const loginUsuarioSchema = z.object({
  username: z.string().min(1, 'El username es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});
export type LoginUsuarioInput = z.infer<typeof loginUsuarioSchema>;
