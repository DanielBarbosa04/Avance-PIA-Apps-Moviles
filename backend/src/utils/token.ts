import jwt from 'jsonwebtoken';

import { ErrorApp } from './errores';

// JWT HS256 que vence a los 7 días. No hay revocación en el servidor:
// cerrar sesión solo borra el token del teléfono.
export function firmarToken(usuarioId: number, secreto: string): string {
  return jwt.sign({}, secreto, {
    algorithm: 'HS256',
    subject: String(usuarioId),
    expiresIn: '7d',
  });
}

export function verificarToken(token: string, secreto: string): number {
  try {
    const carga = jwt.verify(token, secreto, { algorithms: ['HS256'] });
    if (typeof carga === 'string' || typeof carga.sub !== 'string') {
      throw new Error('token sin sub');
    }
    const id = Number(carga.sub);
    if (!Number.isInteger(id) || id <= 0) throw new Error('sub inválido');
    return id;
  } catch {
    throw new ErrorApp(401, 'NO_AUTORIZADO', 'Sesión inválida o vencida');
  }
}
