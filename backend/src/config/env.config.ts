import { config } from 'dotenv';
import z from 'zod';

config();

const envShema = z.object({
  PORT: z.coerce.number().default(3000),
  // JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  // Database
  DATABASE_URL: z.url(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_NAME: z.string(),
});

// eslint-disable-next-line node/no-process-env
const { data, error } = envShema.safeParse(process.env);

if (error) {
  console.error(z.prettifyError(error));
  process.exit(1);
}

export const envConfig = data;
