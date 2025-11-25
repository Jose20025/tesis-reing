import { DateTime } from 'luxon';
import z from 'zod';

const now = DateTime.now();

export const periodoSchema = z.object({
  startDate: z.string().optional().default(now.startOf('month').toISO()),
  endDate: z.string().optional().default(now.endOf('month').toISO()),
});
export type PeriodoInput = z.infer<typeof periodoSchema>;
