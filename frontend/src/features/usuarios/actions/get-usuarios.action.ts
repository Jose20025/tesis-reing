import type { ApiResponse } from '@/interfaces/api.response';
import { toast } from 'sonner';
import { usuariosApi } from '../api/usuarios.api';
import type { Usuario } from '../interfaces/usuario.interface';

export const getUsuariosAction = async () => {
  const { data } = await usuariosApi.get<ApiResponse<Usuario[]>>('/', {});

  toast.success(data.message);

  return data;
};
