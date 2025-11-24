import { ChevronRightIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../ui/sidebar';
import type { SidebarItem } from './AppSidebar';

interface Props {
  item: SidebarItem;
}

export const SidebarLink = ({ item }: Props) => {
  const location = useLocation();

  const isOpen = item.items.some(
    (subItem) => location.pathname === subItem.href
  );

  return (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={isOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            <span>{item.title}</span>
            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={location.pathname === subItem.href}
                >
                  <NavLink to={subItem.href}>
                    <subItem.icon />
                    <span>{subItem.title}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};
