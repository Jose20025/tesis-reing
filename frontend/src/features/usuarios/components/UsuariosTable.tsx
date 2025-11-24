import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Formatter } from '@/lib/formatter';
import { CheckCircleIcon, CircleOffIcon } from 'lucide-react';

import { TipoUsuario, type Usuario } from '../interfaces/usuario.interface';

interface Props {
  usuarios: Usuario[];
  dialogOpen: boolean;
  usuarioSeleccionado: Usuario | null;
  onOpenDialog: (usuario: Usuario) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const UsuariosTable = ({
  usuarios,
  dialogOpen,
  usuarioSeleccionado,
  onOpenDialog,
  onConfirmar,
  onCancelar,
}: Props) => {
  const buildRolBadge = (rol: TipoUsuario) => {
    switch (rol) {
      case TipoUsuario.ADMIN:
        return (
          <Badge variant="destructive" className="capitalize">
            {rol}
          </Badge>
        );
      case TipoUsuario.USUARIO:
        return (
          <Badge variant="secondary" className="capitalize">
            {rol}
          </Badge>
        );
      case TipoUsuario.VERIFICADOR:
        return <Badge className="capitalize">{rol}</Badge>;
    }

    return null;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="w-36">Usuario</TableHead>
            <TableHead className="w-24">Rol</TableHead>
            <TableHead className="text-right w-24">Fecha de Creación</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {usuarios?.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell className="font-medium">{usuario.id}</TableCell>
              <TableCell>{usuario.nombre}</TableCell>
              <TableCell>{usuario.username}</TableCell>
              <TableCell>{buildRolBadge(usuario.rol)}</TableCell>
              <TableCell className="text-right">
                {Formatter.formatDate(usuario.createdAt)}
              </TableCell>
              <TableCell>
                {usuario.activo ? (
                  <Button
                    size={'icon'}
                    variant={'destructive'}
                    title="Marcar como inactivo"
                    disabled={usuario.rol === TipoUsuario.ADMIN}
                    onClick={() => onOpenDialog(usuario)}
                  >
                    <CircleOffIcon />
                  </Button>
                ) : (
                  <Button
                    size={'icon'}
                    title="Marcar como activo"
                    disabled={usuario.rol === TipoUsuario.ADMIN}
                    onClick={() => onOpenDialog(usuario)}
                  >
                    <CheckCircleIcon />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmationDialog
        open={dialogOpen}
        title={
          usuarioSeleccionado?.activo
            ? '¿Marcar usuario como inactivo?'
            : '¿Marcar usuario como activo?'
        }
        description={`¿Estás seguro que deseas ${
          usuarioSeleccionado?.activo ? 'desactivar' : 'activar'
        } al usuario "${usuarioSeleccionado?.nombre}"?`}
        onConfirm={onConfirmar}
        onCancel={onCancelar}
      />
    </>
  );
};
