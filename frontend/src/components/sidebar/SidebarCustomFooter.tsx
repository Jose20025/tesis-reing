import { useAuthStore } from '@/features/auth/stores/auth.store';
import { LogOutIcon, UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import { Badge } from '../ui/badge';

export const SidebarCustomFooter = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <UserIcon />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.nombre}</span>

              <Badge className="capitalize mt-1">{user.tipo}</Badge>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <Button onClick={logout} variant={'destructive'} className="w-full">
            <LogOutIcon />
            Salir
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};
