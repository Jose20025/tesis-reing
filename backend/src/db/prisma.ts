import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from '@/generated/prisma/client';

import { envConfig } from '../config/env.config';

const { DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_USER }
  = envConfig;

const adapter = new PrismaMariaDb({
  host: DATABASE_HOST,
  database: DATABASE_NAME,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
