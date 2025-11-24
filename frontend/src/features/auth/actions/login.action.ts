import type { UsuarioApp } from '@/features/usuarios/interfaces/usuario.interface';
import { authApi } from '../api/auth.api';

export const loginAction = async (username: string, password: string) => {
  const { data } = await authApi.post<UsuarioApp>('/login', {
    username,
    password,
  });

  return data;
};
