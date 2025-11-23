import { DataSource } from 'typeorm';
import { envConfig } from '../config/env.config';

export const AppDataSource = new DataSource({
  type: 'mariadb',
  url: envConfig.DATABASE_URL,
  synchronize: true,
  entities: [],
});
