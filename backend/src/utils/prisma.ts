import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from '../../generated/prisma/client';
import type { Configuracion } from './configuracion';

export function crearPrisma(config: Configuracion) {
  const adaptador = new PrismaMariaDb({
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT,
    user: config.DATABASE_USER,
    password: config.DATABASE_PASSWORD,
    database: config.DATABASE_NAME,
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter: adaptador });
}
