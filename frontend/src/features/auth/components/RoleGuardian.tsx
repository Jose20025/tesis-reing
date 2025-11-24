import type { Usuario } from '@/features/usuarios/interfaces/usuario.interface';
import { Outlet } from 'react-router';
import { useAuthStore } from '../stores/auth.store';

interface Props {
  roles: Usuario['rol'][];
}

export const RoleGuardian = ({ roles }: Props) => {
  const user = useAuthStore((state) => state.user);

  const rolUsuario = user?.rol;

  if (rolUsuario && roles.includes(rolUsuario)) {
    return <Outlet />;
  }

  // TODO: Implementar una página de "No autorizado"
  return <div>No tienes permiso para ver este contenido</div>;
};
