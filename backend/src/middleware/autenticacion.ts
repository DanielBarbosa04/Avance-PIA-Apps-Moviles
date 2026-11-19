import type { RequestHandler } from 'express';

import { ErrorApp } from '../utils/errores';
import { verificarToken } from '../utils/token';

// Exige "Authorization: Bearer <token>" y deja el id del usuario autenticado
// en res.locals.usuarioId. Las rutas usan SIEMPRE ese id (nunca uno que
// llegue en la URL o el cuerpo), así un usuario solo toca sus propios datos.
export function requerirAutenticacion(secreto: string): RequestHandler {
  return (req, res, next) => {
    const [esquema, token] = (req.headers.authorization ?? '').split(' ');
    if (esquema !== 'Bearer' || !token) {
      throw new ErrorApp(401, 'NO_AUTORIZADO', 'Sesión inválida o vencida');
    }
    res.locals.usuarioId = verificarToken(token, secreto);
    next();
  };
}
