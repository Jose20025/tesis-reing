import { cn } from '@/lib/utils';
import { LoaderCircleIcon } from 'lucide-react';

interface Props {
  className?: string;
}

export const Loading = ({ className }: Props) => {
  return (
    <div className={cn('flex justify-center items-center', className)}>
      <LoaderCircleIcon className="animate-spin" />
    </div>
  );
};
