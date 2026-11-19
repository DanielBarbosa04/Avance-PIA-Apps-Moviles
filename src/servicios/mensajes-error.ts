import { ErrorApi } from '@/servicios/api';

// Convierte cualquier error en un texto para mostrar al usuario.
export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorApi) return error.message;
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

// Errores de validación del backend, indexados por campo.
export function erroresPorCampo(error: unknown): Record<string, string> {
  const resultado: Record<string, string> = {};
  if (error instanceof ErrorApi && error.codigo === 'VALIDACION') {
    for (const d of error.detalles ?? []) resultado[d.campo] = d.mensaje;
  }
  return resultado;
}
