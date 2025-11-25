import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { TipoUsuario } from '@/features/usuarios/interfaces/usuario.interface';
import { DollarSign, FileText, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  generarReporteCobranzasConsolidadas,
  generarReporteVentasConsolidadas,
} from '../actions/reportes.action';
import { PeriodoReporteModal } from '../components/PeriodoReporteModal';

export const ReportesAdministrativosPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [modalVentasOpen, setModalVentasOpen] = useState(false);
  const [modalCobranzasOpen, setModalCobranzasOpen] = useState(false);

  if (user?.tipo !== TipoUsuario.ADMINISTRADOR) {
    toast.error('No tienes permiso para acceder a esta página.');
    navigate('/reportes');
  }

  const handleGenerarReporteVentas = async (
    fechaInicio: string,
    fechaFin: string
  ) => {
    try {
      await generarReporteVentasConsolidadas(fechaInicio, fechaFin);
      toast.success('Reporte de ventas generado exitosamente');
    } catch {
      toast.error('Error al generar el reporte de ventas');
    }
  };

  const handleGenerarReporteCobranzas = async (
    fechaInicio: string,
    fechaFin: string
  ) => {
    try {
      await generarReporteCobranzasConsolidadas(fechaInicio, fechaFin);
      toast.success('Reporte de cobranzas generado exitosamente');
    } catch {
      toast.error('Error al generar el reporte de cobranzas');
    }
  };

  return (
    <>
      <header className="mb-6 p-2">
        <h1 className="text-3xl font-bold">Reportes Administrativos</h1>
        <p className="text-slate-700 text-sm">
          Genera reportes detallados de ventas y cobranzas por periodo.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 p-2">
        {/* Card de Reporte de Ventas */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              Reporte de Ventas Consolidadas
            </CardTitle>
            <CardDescription>
              Genera un reporte detallado de todas las ventas realizadas en el
              periodo seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileText className="h-4 w-4" />
                <span>Formato PDF descargable</span>
              </div>
              <Button
                className="w-full gap-2"
                onClick={() => setModalVentasOpen(true)}
              >
                <TrendingUp className="h-4 w-4" />
                Generar Reporte de Ventas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card de Reporte de Cobranzas */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              Reporte de Cobranzas Consolidadas
            </CardTitle>
            <CardDescription>
              Genera un reporte detallado de todas las cobranzas realizadas en
              el periodo seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileText className="h-4 w-4" />
                <span>Formato PDF descargable</span>
              </div>
              <Button
                className="w-full gap-2"
                onClick={() => setModalCobranzasOpen(true)}
                variant="outline"
              >
                <DollarSign className="h-4 w-4" />
                Generar Reporte de Cobranzas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales para seleccionar periodo */}
      <PeriodoReporteModal
        isOpen={modalVentasOpen}
        onClose={() => setModalVentasOpen(false)}
        onGenerate={handleGenerarReporteVentas}
        titulo="Generar Reporte de Ventas"
        descripcion="Selecciona el periodo para generar el reporte de ventas."
      />

      <PeriodoReporteModal
        isOpen={modalCobranzasOpen}
        onClose={() => setModalCobranzasOpen(false)}
        onGenerate={handleGenerarReporteCobranzas}
        titulo="Generar Reporte de Cobranzas"
        descripcion="Selecciona el periodo para generar el reporte de cobranzas."
      />
    </>
  );
};
