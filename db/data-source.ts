import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE ?? 'backend',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  ...(process.env.NODE_ENV !== 'development'
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
  logging: process.env.NODE_ENV === 'development',
  synchronize: false,
};
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
