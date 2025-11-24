import { usuariosApi } from '../api/usuarios.api';
import type { AgregarUsuarioInput } from '../schemas/agregarUsuario.schema';

export const agregarUsuarioAction = async (
  input: Pick<AgregarUsuarioInput, 'nombre' | 'username' | 'password' | 'rol'>
) => {
  const { data } = await usuariosApi.post('/agregar', input, {});

  return data;
};
