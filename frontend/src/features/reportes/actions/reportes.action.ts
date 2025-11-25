import { BASE_URL } from '@/lib/constants';
import { openFile } from '@/lib/files';
import axios from 'axios';
import { DateTime } from 'luxon';

const base = axios.create({
  baseURL: `${BASE_URL}/reportes`,
});

export const generarReporteVentasConsolidadas = async (
  fechaInicio: string,
  fechaFin: string
) => {
  const { data } = await base.get('/consolidado/ventas', {
    params: {
      startDate: DateTime.fromISO(fechaInicio).toISO(),
      endDate: DateTime.fromISO(fechaFin).toISO(),
    },
    responseType: 'blob',
  });

  openFile(data, 'pdf');
};

export const generarReporteCobranzasConsolidadas = async (
  fechaInicio: string,
  fechaFin: string
) => {
  const { data } = await base.get('/consolidado/cobranzas', {
    params: {
      startDate: DateTime.fromISO(fechaInicio).toISO(),
      endDate: DateTime.fromISO(fechaFin).toISO(),
    },
    responseType: 'blob',
  });

  openFile(data, 'pdf');
};
