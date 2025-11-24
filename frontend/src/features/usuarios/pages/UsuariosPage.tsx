import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { RefreshCcwIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cambiarEstadoUsuarioAction } from '../actions/cambiar-estado-usuario.action';
import { getUsuariosAction } from '../actions/get-usuarios.action';
import { AgregarUsuarioModal } from '../components/AgregarUsuarioModal';
import { UsuariosTable } from '../components/UsuariosTable';
import type { GetUsuariosResponse } from '../interfaces/get-usuarios.response';

export const UsuariosPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<
    GetUsuariosResponse['data'][number] | null
  >(null);

  const {
    data: usuariosResponse,
    error,
    // TODO: Implementar loading state
    // isFetching,
    refetch,
  } = useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuariosAction,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: (variables: { id: number; nuevoEstado: boolean }) =>
      cambiarEstadoUsuarioAction(variables.id, variables.nuevoEstado),
    onSuccess: () => {
      toast.success('Estado del usuario actualizado');
      refetch();
    },
    onError: (error) => {
      let errorMessage =
        'Ha ocurrido un error al cambiar el estado del usuario';

      if (isAxiosError(error)) {
        errorMessage = error.response?.data.message || errorMessage;
      }

      toast.error(errorMessage);
    },
  });

  const handleOpenDialog = (usuario: GetUsuariosResponse['data'][number]) => {
    setUsuarioSeleccionado(usuario);
    setDialogOpen(true);
  };

  const handleConfirmar = () => {
    if (usuarioSeleccionado) {
      cambiarEstadoMutation.mutate({
        id: usuarioSeleccionado.id,
        nuevoEstado: !usuarioSeleccionado.activo,
      });
    }
    setDialogOpen(false);
    setUsuarioSeleccionado(null);
  };

  const handleCancelar = () => {
    setDialogOpen(false);
    setUsuarioSeleccionado(null);
  };

  useEffect(() => {
    if (error) {
      let errorMessage = 'Ha ocurrido un error al obtener los usuarios';

      if (isAxiosError(error)) {
        errorMessage = error.response?.data.message || errorMessage;
      }

      toast.error(errorMessage);
    }
  }, [error]);

  return (
    <>
      <header className="mb-2 p-2">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-slate-700 text-sm">
          Gestiona los usuarios que pueden acceder al sistema y sus roles.
        </p>
      </header>

      <div className="px-2 mb-4 flex justify-end items-center gap-2">
        <AgregarUsuarioModal />

        <Button variant={'outline'} onClick={() => refetch()}>
          <RefreshCcwIcon /> Actualizar
        </Button>
      </div>

      <div className="px-2">
        {!error && usuariosResponse && (
          <UsuariosTable
            usuarios={usuariosResponse.data}
            dialogOpen={dialogOpen}
            usuarioSeleccionado={usuarioSeleccionado}
            onOpenDialog={handleOpenDialog}
            onConfirmar={handleConfirmar}
            onCancelar={handleCancelar}
          />
        )}
      </div>
    </>
  );
};
