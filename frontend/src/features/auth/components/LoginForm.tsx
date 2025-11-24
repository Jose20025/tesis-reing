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
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { loginAction } from '../actions/login.action';
import { loginSchema, type LoginSchema } from '../schemas/login.schema';
import { useAuthStore } from '../stores/auth.store';

export const LoginForm = () => {
  const loginToStore = useAuthStore((state) => state.login);

  const navigate = useNavigate();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginSchema) =>
      loginAction(data.username, data.password),
    onError: (error) => {
      let errorMessage = 'Ha ocurrido un error al iniciar sesión';

      if (isAxiosError(error)) {
        errorMessage = error.response?.data.error || errorMessage;
      }

      toast.error(errorMessage);
    },
    onSuccess: (loginResponse) => {
      loginToStore(loginResponse);

      toast.success('Inicio de sesión exitoso');

      navigate('/reportes', { replace: true });
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    loginMutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Ingresar al sistema</h1>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>

                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} type="password" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Login
          </Button>
        </div>
      </form>
    </Form>
  );
};
