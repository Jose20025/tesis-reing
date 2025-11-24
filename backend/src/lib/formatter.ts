import { DateTime } from 'luxon';

export interface FormatDateOptions {
  format?: string;
  locale?: string;
}

export interface FormatNumberOptions {
  withZeros?: boolean;
}

export class Formatter {
  static formatDate(
    date: string | Date,
    options: FormatDateOptions = {},
  ): string {
    const defaultOptions: Required<FormatDateOptions> = {
      format: 'D',
      locale: 'es',
    };
    const { format, locale } = { ...defaultOptions, ...options };

    if (date instanceof Date) {
      const luxonDate = DateTime.fromJSDate(date);

      if (!luxonDate.isValid) {
        throw new Error('Fecha no válida');
      }

      return luxonDate.toFormat(format);
    }

    const luxonDate = DateTime.fromISO(date, { locale });

    if (!luxonDate.isValid) {
      throw new Error('Fecha no válida');
    }

    return luxonDate.toFormat(format);
  }

  static formatNumber(
    value: number,
    options: FormatNumberOptions = {},
  ): string {
    const { withZeros = true } = options;

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: withZeros ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
