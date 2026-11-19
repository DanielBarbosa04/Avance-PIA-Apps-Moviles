import express from 'express';

import { requerirAutenticacion } from './middleware/autenticacion';
import { manejadorErrores, rutaNoEncontrada } from './middleware/errores';
import { rutasAuth } from './rutas/auth';
import { rutasPerfil } from './rutas/perfil';
import type { PrismaClient } from '../generated/prisma/client';
import type { Configuracion } from './utils/configuracion';

export type BaseDatos = Pick<PrismaClient, 'usuario'>;

// La app se arma con la BD y la configuración recibidas por parámetro:
// así server.ts usa MySQL real y las pruebas usan una BD falsa.
export function crearApp(bd: BaseDatos, config: Configuracion) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/salud', (_req, res) => {
    res.json({ estado: 'ok', app: 'DynaMD API' });
  });

  app.use('/api/auth', rutasAuth(bd, config.JWT_SECRET, config.LIMITE_AUTH_15MIN));
  app.use('/api/perfil', requerirAutenticacion(config.JWT_SECRET), rutasPerfil(bd));

  app.use(rutaNoEncontrada);
  app.use(manejadorErrores);
  return app;
}
