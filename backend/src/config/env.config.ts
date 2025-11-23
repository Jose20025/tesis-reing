import { config } from 'dotenv';
import z from 'zod';

config();

const envShema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),
  // JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

// eslint-disable-next-line node/no-process-env
const { data, error } = envShema.safeParse(process.env);

if (error) {
  console.error(z.prettifyError(error));
  process.exit(1);
}

export const envConfig = data;
