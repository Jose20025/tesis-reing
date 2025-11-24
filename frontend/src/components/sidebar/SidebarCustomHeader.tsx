import kaisLogo from '@/assets/kais-white-logo.png';
import { SidebarHeader } from '../ui/sidebar';

export const SidebarCustomHeader = () => {
  return (
    <SidebarHeader>
      <div className="p-2 bg-kais-primary rounded-md shadow-sm h-28 relative">
        <img
          src={kaisLogo}
          alt="KAIS Logo"
          className="h-full object-contain mx-auto"
        />
      </div>
    </SidebarHeader>
  );
};
