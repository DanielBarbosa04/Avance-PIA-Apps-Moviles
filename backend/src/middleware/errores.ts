import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { ErrorApp } from '../utils/errores';

export const rutaNoEncontrada: RequestHandler = (_req, _res, next) => {
  next(new ErrorApp(404, 'NO_ENCONTRADO', 'Ruta no encontrada'));
};

// Respuesta uniforme: { error: { codigo, mensaje, detalles? } }
export const manejadorErrores: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ErrorApp) {
    res.status(error.estado).json({
      error: {
        codigo: error.codigo,
        mensaje: error.message,
        ...(error.detalles !== undefined && { detalles: error.detalles }),
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        codigo: 'VALIDACION',
        mensaje: 'Datos inválidos',
        detalles: error.issues.map((p) => ({
          campo: p.path.join('.'),
          mensaje: p.message,
        })),
      },
    });
    return;
  }

  // Errores del lector de JSON de Express (JSON mal formado, cuerpo muy grande)
  const estado = (error as { status?: unknown }).status;
  if (typeof estado === 'number' && estado >= 400 && estado < 500) {
    res.status(estado).json({
      error: { codigo: 'PETICION_INVALIDA', mensaje: 'Petición inválida' },
    });
    return;
  }

  console.error('Error inesperado:', error);
  res.status(500).json({
    error: { codigo: 'ERROR_INTERNO', mensaje: 'Error interno del servidor' },
  });
};
