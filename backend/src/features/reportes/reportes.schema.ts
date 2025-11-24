import { DateTime } from 'luxon';
import z from 'zod';

const now = DateTime.now();

export const periodoSchema = z.object({
  startDate: z.union([z.iso.date(), z.iso.datetime()]).optional().default(now.startOf('month').toISO()),
  endDate: z.union([z.iso.date(), z.iso.datetime()]).optional().default(now.endOf('month').toISO()),
});
export type PeriodoInput = z.infer<typeof periodoSchema>;
