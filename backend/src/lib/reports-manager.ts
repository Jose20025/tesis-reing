import type { Content, DynamicContent, TableLayout, TDocumentDefinitions } from 'pdfmake/interfaces';

import { DateTime } from 'luxon';
import PdfPrinter from 'pdfmake';

const fonts = {
  Roboto: {
    normal: 'assets/fonts/Roboto-Regular.ttf',
    bold: 'assets/fonts/Roboto-Medium.ttf',
    italics: 'assets/fonts/Roboto-Italic.ttf',
    bolditalics: 'assets/fonts/Roboto-BoldItalic.ttf',
  },
};

export class ReportsManager {
  private printer = new PdfPrinter(fonts);

  static buildHeader(): Content | DynamicContent {
    return (page: number) => {
      if (page === 1) {
        return {
          columns: [
            {
              image: 'assets/kais-logo-sin-fondo.png',
              width: 100,
              alignment: 'left',
              margin: [10, -10],
            },
            {
              text: ['Fecha de Impresión: ', DateTime.now().toFormat('D')],
              alignment: 'right',
              margin: [10, 10],
              style: {
                fontSize: 10,
              },
            },
          ],
        };
      }
    };
  }

  static buildDivider(verticalMargin: number = 10): Content {
    return {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }],
      margin: [0, verticalMargin],
    };
  }

  static buildTableLayout(): TableLayout {
    return {
      hLineWidth(i, node) {
        if (i === 0 || i === node.table.body.length) {
          return 0;
        }
        return i === 1 ? 2 : 1;
      },
      hLineStyle(i) {
        // Si no es la fila del header, aplica un estilo punteado
        return i === 1 ? null : { dash: { length: 2, space: 2 } }; // Línea punteada
      },
      hLineColor(i) {
        return i === 1 ? 'black' : '#aaa'; // Color de la línea
      },
      vLineWidth() {
        // No mostrar líneas verticales
        return 0;
      },
    };
  }

  generatePdf(docDefinition: TDocumentDefinitions, title?: string) {
    const pdfDoc = this.printer.createPdfKitDocument(docDefinition);

    pdfDoc.info.Title = title || 'Documento';
    pdfDoc.info.Author = 'KAIS';
    pdfDoc.info.Producer = 'KAIS';
    pdfDoc.info.Creator = 'KAIS';

    return pdfDoc;
  }
}
