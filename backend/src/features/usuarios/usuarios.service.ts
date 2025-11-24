import { prisma } from '@/src/db/prisma';
import { CustomHttpError } from '@/src/lib/error-handler';
import { comparePasswords, hashPassword } from '@/src/lib/password-utils';

import type { CreateUsuarioInput } from './usuarios.schema';

export class UsuariosService {
  async getAll() {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { nombre: 'asc' },
    });

    return usuarios;
  }

  async getById(id: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new CustomHttpError('Usuario no encontrado', 404);
    }

    return usuario;
  }

  async login(username: string, password: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { username },
    });

    if (!usuario) {
      throw new CustomHttpError('Usuario no encontrado', 404);
    }

    const isPasswordValid = await comparePasswords(password, usuario.password);

    if (!isPasswordValid) {
      throw new CustomHttpError('Contraseña incorrecta', 401);
    }

    const { password: _, ...usuarioSinPassword } = usuario;

    return usuarioSinPassword;
  }

  async register(input: CreateUsuarioInput) {
    const existingUser = await prisma.usuario.findUnique({
      where: { username: input.username },
    });

    if (existingUser) {
      throw new CustomHttpError('El username ya está en uso', 400);
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(input.password);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        ...input,
        password: hashedPassword,
      },
      omit: { password: true },
    });

    return nuevoUsuario;
  }
}
