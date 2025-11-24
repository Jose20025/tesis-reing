import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import { prisma } from '@/src/db/prisma';
import { Formatter } from '@/src/lib/formatter';
import { ReportsManager } from '@/src/lib/reports-manager';

import type { PeriodoInput } from './reportes.schema';

const printer = new ReportsManager();

export class ReportesAdministradorService {
  async generarConsolidadoVentasReporte(periodo: PeriodoInput) {
    const vendedores = await prisma.vendedor.findMany({
      orderBy: { codigo: 'asc' },
      select: { id: true, codigo: true, nombre: true },
    });

    const ventasPorVendedor = await Promise.all(
      vendedores.map(async (vendedor) => {
        const ventas = await prisma.venta.findMany({
          where: {
            vendedorId: vendedor.id,
            fecha: {
              gte: periodo.startDate,
              lte: periodo.endDate,
            },
          },
          include: {
            cliente: {
              select: { codigo: true, nombre: true },
            },
          },
          orderBy: { fecha: 'asc' },
        });

        return {
          vendedor,
          ventas,
          totales: {
            total: ventas.reduce((sum, venta) => sum + venta.total, 0),
            descuento: ventas.reduce((sum, venta) => sum + venta.descuento, 0),
            neto: ventas.reduce((sum, venta) => sum + venta.neto, 0),
          },
        };
      }),
    );

    // Calcular totales generales
    const totalesGenerales = ventasPorVendedor.reduce(
      (acc, vendedorData) => ({
        total: acc.total + vendedorData.totales.total,
        descuento: acc.descuento + vendedorData.totales.descuento,
        neto: acc.neto + vendedorData.totales.neto,
      }),
      { total: 0, descuento: 0, neto: 0 },
    );

    // Construir contenido del reporte
    const content: any[] = [
      {
        text: 'Reporte Consolidado de Ventas',
        style: 'title',
        alignment: 'center',
        margin: [0, 20, 0, 20],
      },
      {
        text: `Período: ${Formatter.formatDate(periodo.startDate)} al ${Formatter.formatDate(periodo.endDate)}`,
        style: 'subtitle',
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },
      ReportsManager.buildDivider(),
    ];

    // Agregar datos por cada vendedor
    ventasPorVendedor.forEach((vendedorData) => {
      // Encabezado del vendedor
      content.push({
        text: `${vendedorData.vendedor.codigo}: ${vendedorData.vendedor.nombre}`,
        style: 'vendedorHeader',
        margin: [0, 15, 0, 10],
      });

      if (vendedorData.ventas.length === 0) {
        content.push({
          text: 'Sin ventas en el período seleccionado',
          style: 'noData',
          margin: [0, 0, 0, 10],
        });
      }
      else {
        // Tabla de ventas del vendedor
        const tableData: any[] = [
          [
            { text: 'Fecha', style: 'tableHeader' },
            { text: 'Correlativo', style: 'tableHeader' },
            { text: 'Cliente', style: 'tableHeader' },
            { text: 'Total Bs.', style: 'tableHeader' },
            { text: 'Descuento Bs.', style: 'tableHeader' },
            { text: 'Neto Bs.', style: 'tableHeader' },
          ],
        ];

        vendedorData.ventas.forEach((venta) => {
          tableData.push([
            { text: Formatter.formatDate(venta.fecha), style: 'tableData' },
            { text: venta.idCorrelativo.toString(), style: 'tableData' },
            { text: `${venta.cliente.codigo} - ${venta.cliente.nombre}`, style: 'tableData' },
            { text: Formatter.formatNumber(venta.total), alignment: 'right', style: 'tableData' },
            { text: Formatter.formatNumber(venta.descuento), alignment: 'right', style: 'tableData' },
            { text: Formatter.formatNumber(venta.neto), alignment: 'right', style: 'tableData' },
          ]);
        });

        // Totales del vendedor
        tableData.push([
          { text: 'Subtotal:', colSpan: 3, alignment: 'right', style: 'tableSubtotal' },
          {},
          {},
          { text: Formatter.formatNumber(vendedorData.totales.total), alignment: 'right', style: 'tableSubtotal' },
          { text: Formatter.formatNumber(vendedorData.totales.descuento), alignment: 'right', style: 'tableSubtotal' },
          { text: Formatter.formatNumber(vendedorData.totales.neto), alignment: 'right', style: 'tableSubtotal' },
        ]);

        content.push({
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
            body: tableData,
          },
          layout: ReportsManager.buildTableLayout(),
          margin: [0, 5, 0, 10],
        });
      }

      content.push(ReportsManager.buildDivider());
    });

    // Totales generales
    content.push({
      text: 'RESUMEN GENERAL',
      style: 'summaryTitle',
      alignment: 'center',
      margin: [0, 20, 0, 10],
    });

    const resumenTable = [
      [
        { text: 'Concepto', style: 'tableHeader' },
        { text: 'Importe Bs.', style: 'tableHeader' },
      ],
      [
        { text: 'Total Ventas:', style: 'tableData' },
        { text: Formatter.formatNumber(totalesGenerales.total), alignment: 'right', style: 'tableData' },
      ],
      [
        { text: 'Total Descuentos:', style: 'tableData' },
        { text: Formatter.formatNumber(totalesGenerales.descuento), alignment: 'right', style: 'tableData' },
      ],
      [
        { text: 'TOTAL NETO:', style: 'tableFooter' },
        { text: Formatter.formatNumber(totalesGenerales.neto), alignment: 'right', style: 'tableFooter' },
      ],
    ];

    content.push({
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: resumenTable,
      },
      layout: ReportsManager.buildTableLayout(),
      alignment: 'center',
      margin: [150, 0, 150, 0],
    });

    const documentDefinitions: TDocumentDefinitions = {
      header: ReportsManager.buildHeader(),
      content,
      styles: {
        title: {
          fontSize: 18,
          bold: true,
          color: '#2c3e50',
        },
        subtitle: {
          fontSize: 12,
          italics: true,
          color: '#7f8c8d',
        },
        vendedorHeader: {
          fontSize: 14,
          bold: true,
          color: '#34495e',
        },
        summaryTitle: {
          fontSize: 16,
          bold: true,
          color: '#2c3e50',
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#2c3e50',
          fillColor: '#ecf0f1',
        },
        tableData: {
          fontSize: 9,
          color: '#2c3e50',
        },
        tableSubtotal: {
          bold: true,
          fontSize: 9,
          color: '#2c3e50',
          fillColor: '#f8f9fa',
        },
        tableFooter: {
          bold: true,
          fontSize: 11,
          color: '#2c3e50',
          fillColor: '#d5dbdb',
        },
        noData: {
          fontSize: 10,
          italics: true,
          color: '#95a5a6',
        },
      },
    };

    const reporte = printer.generatePdf(documentDefinitions, 'Consolidado de Ventas');
    return reporte;
  }

  async generarConsolidadoCobranzasReporte(periodo: PeriodoInput) {
    const vendedores = await prisma.vendedor.findMany({
      orderBy: { codigo: 'asc' },
      select: { id: true, codigo: true, nombre: true },
    });

    const cobranzasPorVendedor = await Promise.all(
      vendedores.map(async (vendedor) => {
        const cobranzas = await prisma.pago.findMany({
          where: {
            vendedorId: vendedor.id,
            ventaId: { not: null }, // Solo cobranzas de ventas
            fecha: {
              gte: periodo.startDate,
              lte: periodo.endDate,
            },
          },
          include: {
            venta: {
              select: {
                idCorrelativo: true,
                cliente: {
                  select: { codigo: true, nombre: true },
                },
              },
            },
            billetera: {
              select: { codigo: true, descripcion: true, moneda: true },
            },
          },
          orderBy: { fecha: 'asc' },
        });

        return {
          vendedor,
          cobranzas,
          totalCobranzas: cobranzas.reduce((sum, cobranza) => sum + cobranza.importe, 0),
        };
      }),
    );

    // Calcular total general
    const totalGeneral = cobranzasPorVendedor.reduce(
      (acc, vendedorData) => acc + vendedorData.totalCobranzas,
      0,
    );

    // Construir contenido del reporte
    const content: any[] = [
      {
        text: 'Reporte Consolidado de Cobranzas',
        style: 'title',
        alignment: 'center',
        margin: [0, 20, 0, 20],
      },
      {
        text: `Período: ${Formatter.formatDate(periodo.startDate)} al ${Formatter.formatDate(periodo.endDate)}`,
        style: 'subtitle',
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },
      ReportsManager.buildDivider(),
    ];

    // Agregar datos por cada vendedor
    cobranzasPorVendedor.forEach((vendedorData) => {
      // Encabezado del vendedor
      content.push({
        text: `${vendedorData.vendedor.codigo}: ${vendedorData.vendedor.nombre}`,
        style: 'vendedorHeader',
        margin: [0, 15, 0, 10],
      });

      if (vendedorData.cobranzas.length === 0) {
        content.push({
          text: 'Sin cobranzas en el período seleccionado',
          style: 'noData',
          margin: [0, 0, 0, 10],
        });
      }
      else {
        // Tabla de cobranzas del vendedor
        const tableData: any[] = [
          [
            { text: 'Fecha', style: 'tableHeader' },
            { text: 'Venta', style: 'tableHeader' },
            { text: 'Cliente', style: 'tableHeader' },
            { text: 'Billetera', style: 'tableHeader' },
            { text: 'Importe Bs.', style: 'tableHeader' },
            { text: 'Recibo', style: 'tableHeader' },
          ],
        ];

        vendedorData.cobranzas.forEach((cobranza) => {
          tableData.push([
            { text: Formatter.formatDate(cobranza.fecha), style: 'tableData' },
            { text: cobranza.venta?.idCorrelativo?.toString() || '-', style: 'tableData' },
            { text: `${cobranza.venta?.cliente.codigo} - ${cobranza.venta?.cliente.nombre}`, style: 'tableData' },
            { text: `${cobranza.billetera.codigo} - ${cobranza.billetera.descripcion}`, style: 'tableData' },
            { text: Formatter.formatNumber(cobranza.importe), alignment: 'right', style: 'tableData' },
            { text: cobranza.recibo || '-', style: 'tableData' },
          ]);
        });

        // Total del vendedor
        tableData.push([
          { text: 'Subtotal:', colSpan: 4, alignment: 'right', style: 'tableSubtotal' },
          {},
          {},
          {},
          { text: Formatter.formatNumber(vendedorData.totalCobranzas), alignment: 'right', style: 'tableSubtotal' },
          { text: '', style: 'tableSubtotal' },
        ]);

        content.push({
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*', 'auto', 'auto'],
            body: tableData,
          },
          layout: ReportsManager.buildTableLayout(),
          margin: [0, 5, 0, 10],
        });
      }

      content.push(ReportsManager.buildDivider());
    });

    // Total general
    content.push({
      text: 'RESUMEN GENERAL',
      style: 'summaryTitle',
      alignment: 'center',
      margin: [0, 20, 0, 10],
    });

    const resumenTable = [
      [
        { text: 'Concepto', style: 'tableHeader' },
        { text: 'Importe Bs.', style: 'tableHeader' },
      ],
      [
        { text: 'TOTAL COBRANZAS:', style: 'tableFooter' },
        { text: Formatter.formatNumber(totalGeneral), alignment: 'right', style: 'tableFooter' },
      ],
    ];

    content.push({
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: resumenTable,
      },
      layout: ReportsManager.buildTableLayout(),
      alignment: 'center',
      margin: [150, 0, 150, 0],
    });

    const documentDefinitions: TDocumentDefinitions = {
      header: ReportsManager.buildHeader(),
      content,
      styles: {
        title: {
          fontSize: 18,
          bold: true,
          color: '#2c3e50',
        },
        subtitle: {
          fontSize: 12,
          italics: true,
          color: '#7f8c8d',
        },
        vendedorHeader: {
          fontSize: 14,
          bold: true,
          color: '#34495e',
        },
        summaryTitle: {
          fontSize: 16,
          bold: true,
          color: '#2c3e50',
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#2c3e50',
          fillColor: '#ecf0f1',
        },
        tableData: {
          fontSize: 9,
          color: '#2c3e50',
        },
        tableSubtotal: {
          bold: true,
          fontSize: 9,
          color: '#2c3e50',
          fillColor: '#f8f9fa',
        },
        tableFooter: {
          bold: true,
          fontSize: 11,
          color: '#2c3e50',
          fillColor: '#d5dbdb',
        },
        noData: {
          fontSize: 10,
          italics: true,
          color: '#95a5a6',
        },
      },
    };

    const reporte = printer.generatePdf(documentDefinitions, 'Consolidado de Cobranzas');
    return reporte;
  }
}

export class ReportesVendedorService {
  async generarMisVentasReporte(vendedorId: number, periodo: PeriodoInput) {
    const vendedor = await prisma.vendedor.findUnique({
      where: { id: vendedorId },
      select: { nombre: true, codigo: true },
    });

    const ventas = await prisma.venta.findMany({
      where: {
        vendedorId,
        fecha: {
          gte: periodo.startDate,
          lte: periodo.endDate,
        },

      },
      include: {
        cliente: {
          select: { codigo: true, nombre: true },
        },
      },
    });

    // Preparar datos para la tabla
    const tableData: any[] = [
      // Header de la tabla
      [
        { text: 'Fecha', style: 'tableHeader' },
        { text: 'Correlativo', style: 'tableHeader' },
        { text: 'Cliente', style: 'tableHeader' },
        { text: 'Total Bs.', style: 'tableHeader' },
        { text: 'Descuento Bs.', style: 'tableHeader' },
        { text: 'Neto Bs.', style: 'tableHeader' },
      ],
    ];

    // Agregar datos de ventas
    ventas.forEach((venta) => {
      tableData.push([
        { text: Formatter.formatDate(venta.fecha), style: 'tableData' },
        { text: venta.idCorrelativo.toString(), style: 'tableData' },
        { text: `${venta.cliente.codigo} - ${venta.cliente.nombre}`, style: 'tableData' },
        { text: Formatter.formatNumber(venta.total), alignment: 'right', style: 'tableData' },
        { text: Formatter.formatNumber(venta.descuento), alignment: 'right', style: 'tableData' },
        { text: Formatter.formatNumber(venta.neto), alignment: 'right', style: 'tableData' },
      ]);
    });

    // Calcular totales
    const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const totalDescuentos = ventas.reduce((sum, venta) => sum + venta.descuento, 0);
    const totalNeto = ventas.reduce((sum, venta) => sum + venta.neto, 0);

    // Agregar fila de totales
    tableData.push([
      { text: 'TOTALES:', colSpan: 3, alignment: 'right', style: 'tableFooter' },
      {},
      {},
      { text: Formatter.formatNumber(totalVentas), alignment: 'right', style: 'tableFooter' },
      { text: Formatter.formatNumber(totalDescuentos), alignment: 'right', style: 'tableFooter' },
      { text: Formatter.formatNumber(totalNeto), alignment: 'right', style: 'tableFooter' },
    ]);

    const documentDefinitions: TDocumentDefinitions = {
      header: ReportsManager.buildHeader(),
      content: [
        {
          text: `Reporte de Ventas - ${vendedor?.codigo}: ${vendedor?.nombre}`,
          style: 'title',
          alignment: 'center',
          margin: [0, 20, 0, 20],
        },
        {
          text: `Período: ${Formatter.formatDate(periodo.startDate)} al ${Formatter.formatDate(periodo.endDate)}`,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        ReportsManager.buildDivider(),
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
            body: tableData,
          },
          layout: ReportsManager.buildTableLayout(),
          margin: [0, 10],
        },
      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          color: '#2c3e50',
        },
        subtitle: {
          fontSize: 12,
          italics: true,
          color: '#7f8c8d',
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#2c3e50',
          fillColor: '#ecf0f1',
        },
        tableData: {
          fontSize: 9,
          color: '#2c3e50',
        },
        tableFooter: {
          bold: true,
          fontSize: 10,
          color: '#2c3e50',
          fillColor: '#d5dbdb',
        },
        summary: {
          fontSize: 10,
          italics: true,
          color: '#7f8c8d',
        },
      },
    };

    const reporte = printer.generatePdf(documentDefinitions, `Mis ventas`);

    return reporte;
  }

  async generarMisCobranzasReporte(vendedorId: number, periodo: PeriodoInput) {
    const vendedor = await prisma.vendedor.findUnique({
      where: { id: vendedorId },
      select: { nombre: true, codigo: true },
    });

    const cobranzas = await prisma.pago.findMany({
      where: {
        vendedorId,
        ventaId: { not: null }, // Solo cobranzas de ventas, no pagos a proveedores
        fecha: {
          gte: periodo.startDate,
          lte: periodo.endDate,
        },
      },
      include: {
        venta: {
          select: {
            idCorrelativo: true,
            cliente: {
              select: { codigo: true, nombre: true },
            },
          },
        },
        billetera: {
          select: { codigo: true, descripcion: true, moneda: true },
        },
      },
      orderBy: {
        fecha: 'asc',
      },
    });

    // Preparar datos para la tabla
    const tableData: any[] = [
      // Header de la tabla
      [
        { text: 'Fecha', style: 'tableHeader' },
        { text: 'Venta', style: 'tableHeader' },
        { text: 'Cliente', style: 'tableHeader' },
        { text: 'Billetera', style: 'tableHeader' },
        { text: 'Importe Bs.', style: 'tableHeader' },
        { text: 'Recibo', style: 'tableHeader' },
      ],
    ];

    // Agregar datos de cobranzas
    cobranzas.forEach((cobranza) => {
      tableData.push([
        { text: Formatter.formatDate(cobranza.fecha), style: 'tableData' },
        { text: cobranza.venta?.idCorrelativo?.toString() || '-', style: 'tableData' },
        { text: `${cobranza.venta?.cliente.codigo} - ${cobranza.venta?.cliente.nombre}`, style: 'tableData' },
        { text: `${cobranza.billetera.codigo} - ${cobranza.billetera.descripcion}`, style: 'tableData' },
        { text: Formatter.formatNumber(cobranza.importe), alignment: 'right', style: 'tableData' },
        { text: cobranza.recibo || '-', style: 'tableData' },
      ]);
    });

    // Calcular totales
    const totalCobranzas = cobranzas.reduce((sum, cobranza) => sum + cobranza.importe, 0);

    // Agregar fila de totales
    tableData.push([
      { text: 'TOTAL:', colSpan: 4, alignment: 'right', style: 'tableFooter' },
      {},
      {},
      {},
      { text: Formatter.formatNumber(totalCobranzas), alignment: 'right', style: 'tableFooter' },
      { text: '', style: 'tableFooter' },
    ]);

    const documentDefinitions: TDocumentDefinitions = {
      header: ReportsManager.buildHeader(),
      content: [
        {
          text: `Reporte de Cobranzas - ${vendedor?.codigo}: ${vendedor?.nombre}`,
          style: 'title',
          alignment: 'center',
          margin: [0, 20, 0, 20],
        },
        {
          text: `Período: ${Formatter.formatDate(periodo.startDate)} al ${Formatter.formatDate(periodo.endDate)}`,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        ReportsManager.buildDivider(),
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*', 'auto', 'auto'],
            body: tableData,
          },
          layout: ReportsManager.buildTableLayout(),
          margin: [0, 10],
        },
      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          color: '#2c3e50',
        },
        subtitle: {
          fontSize: 12,
          italics: true,
          color: '#7f8c8d',
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#2c3e50',
          fillColor: '#ecf0f1',
        },
        tableData: {
          fontSize: 9,
          color: '#2c3e50',
        },
        tableFooter: {
          bold: true,
          fontSize: 10,
          color: '#2c3e50',
          fillColor: '#d5dbdb',
        },
        summary: {
          fontSize: 10,
          italics: true,
          color: '#7f8c8d',
        },
      },
    };

    const reporte = printer.generatePdf(documentDefinitions, `Mis cobranzas`);

    return reporte;
  }
}
