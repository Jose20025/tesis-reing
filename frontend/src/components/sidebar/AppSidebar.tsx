import { useAuthStore } from '@/features/auth/stores/auth.store';
import { TipoUsuario } from '@/features/usuarios/interfaces/usuario.interface';
import { FileIcon, LayoutDashboardIcon, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
} from '../ui/sidebar';
import { SidebarCustomFooter } from './SidebarCustomFooter';
import { SidebarCustomHeader } from './SidebarCustomHeader';
import { SidebarLink } from './SidebarLink';

export type SidebarItem = {
  title: string;
  icon: LucideIcon;

  items: SidebarSubItem[];
};

export type SidebarSubItem = {
  title: string;
  icon: LucideIcon;
  href: string;
  rolesRequired: TipoUsuario[];
};

const items: SidebarItem[] = [
  {
    title: 'General',
    icon: LayoutDashboardIcon,
    items: [
      {
        title: 'Reportes Administrativos',
        icon: FileIcon,
        href: '/reportes-administrativos',
        rolesRequired: [TipoUsuario.ADMINISTRADOR],
      },
      {
        title: 'Reportes',
        icon: FileIcon,
        href: '/reportes',
        rolesRequired: [TipoUsuario.ADMINISTRADOR, TipoUsuario.VENDEDOR],
      },
    ],
  },
];

const getAvailableItems = (tipo: TipoUsuario) => {
  return items
    .filter((item) =>
      item.items.some((subItem) => subItem.rolesRequired.includes(tipo))
    )
    .map((item) => ({
      ...item,
      items: item.items.filter((subItem) =>
        subItem.rolesRequired.includes(tipo)
      ),
    }));
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);

  const availableItems = useMemo(() => {
    if (!user) return [];
    return getAvailableItems(user.tipo);
  }, [user]);

  return (
    <Sidebar {...props}>
      <SidebarCustomHeader />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {availableItems.map((item) => (
              <SidebarLink key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarCustomFooter />
    </Sidebar>
  );
}
