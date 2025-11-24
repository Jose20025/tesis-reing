import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { agregarUsuarioAction } from '../actions/agregar-usuario.action';
import { TipoUsuario } from '../interfaces/usuario.interface';
import {
  agregarUsuarioSchema,
  type AgregarUsuarioInput,
} from '../schemas/agregarUsuario.schema';

interface Props {
  onAdded?: () => void;
}

export const AgregarUsuarioForm = ({ onAdded }: Props) => {
  const queryClient = useQueryClient();

  const agregarUsuarioMutation = useMutation({
    mutationFn: (
      input: Pick<
        AgregarUsuarioInput,
        'nombre' | 'username' | 'password' | 'rol'
      >
    ) => agregarUsuarioAction(input),
    onError: (error) => {
      let errorMessage = 'Ha ocurrido un error al agregar el usuario';

      if (isAxiosError(error)) {
        errorMessage = error.response?.data.message || errorMessage;
      }

      toast.error(errorMessage);
    },
    onSuccess: (data) => {
      toast.success(data.message);

      form.reset();

      // Refetch usuarios
      queryClient.invalidateQueries({
        queryKey: ['usuarios'],
      });

      onAdded?.();
    },
  });

  const form = useForm<AgregarUsuarioInput>({
    resolver: zodResolver(agregarUsuarioSchema),
    defaultValues: {
      nombre: '',
      username: '',
      password: '',
      confirmPassword: '',
      rol: TipoUsuario.USUARIO,
    },
  });

  const onSubmit: SubmitHandler<AgregarUsuarioInput> = async (data) => {
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', {
        message: 'Las contraseñas no coinciden',
        type: 'manual',
      });

      return;
    }

    agregarUsuarioMutation.mutate({
      nombre: data.nombre,
      username: data.username,
      password: data.password,
      rol: data.rol,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Contraseña" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="usuario">Usuario</SelectItem>
                  <SelectItem value="verificador">Verificador</SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={agregarUsuarioMutation.isPending}
        >
          Agregar usuario
        </Button>
      </form>
    </Form>
  );
};
