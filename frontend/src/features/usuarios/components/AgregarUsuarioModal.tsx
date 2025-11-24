import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusIcon } from 'lucide-react';
import { AgregarUsuarioForm } from './AgregarUsuarioForm';
import { useState } from 'react';

export const AgregarUsuarioModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon /> Agregar
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar usuario</DialogTitle>
          <DialogDescription>
            Aquí puedes agregar un nuevo usuario al sistema.
          </DialogDescription>
        </DialogHeader>

        <AgregarUsuarioForm onAdded={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
