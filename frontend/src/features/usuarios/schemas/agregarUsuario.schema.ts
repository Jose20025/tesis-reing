import z from 'zod';
import { TipoUsuario } from '../interfaces/usuario.interface';

export const agregarUsuarioSchema = z.object({
  nombre: z.string().trim().nonempty('El nombre es obligatorio'),
  username: z.string().trim().nonempty('El usuario es obligatorio'),
  password: z.string().trim().nonempty('La contraseña es obligatoria'),
  confirmPassword: z
    .string()
    .trim()
    .nonempty('La confirmación de la contraseña es obligatoria'),
  rol: z.enum(TipoUsuario, { error: 'El rol debe ser válido' }),
});

export type AgregarUsuarioInput = z.infer<typeof agregarUsuarioSchema>;
