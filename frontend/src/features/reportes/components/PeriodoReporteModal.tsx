import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, FileText } from 'lucide-react';
import { useState } from 'react';

interface PeriodoReporteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (fechaInicio: string, fechaFin: string) => void;
  titulo: string;
  descripcion: string;
}

export const PeriodoReporteModal = ({
  isOpen,
  onClose,
  onGenerate,
  titulo,
  descripcion,
}: PeriodoReporteModalProps) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleGenerate = () => {
    if (!fechaInicio || !fechaFin) {
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      return;
    }

    onGenerate(fechaInicio, fechaFin);
    onClose();
    setFechaInicio('');
    setFechaFin('');
  };

  const handleClose = () => {
    onClose();
    setFechaInicio('');
    setFechaFin('');
  };

  const isFormValid =
    fechaInicio && fechaFin && new Date(fechaInicio) <= new Date(fechaFin);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {titulo}
          </DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fechaInicio" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Fecha de Inicio
            </Label>
            <Input
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fechaFin" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Fecha de Fin
            </Label>
            <Input
              id="fechaFin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              min={fechaInicio}
              className="w-full"
            />
          </div>

          {fechaInicio &&
            fechaFin &&
            new Date(fechaInicio) > new Date(fechaFin) && (
              <p className="text-sm text-red-600">
                La fecha de inicio debe ser anterior a la fecha de fin
              </p>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!isFormValid}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Generar Reporte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
