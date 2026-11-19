import { Router } from 'express';

import type { BaseDatos } from '../app';
import { esquemaActualizarPerfil } from '../validacion/esquemas';
import { ErrorApp } from '../utils/errores';
import { aPublico, seleccionPublica } from '../utils/usuario-publico';

const sesionInvalida = () =>
  new ErrorApp(401, 'NO_AUTORIZADO', 'Sesión inválida o vencida');

// Solo existen rutas "/perfil" (sin :id): siempre se usa el id del token.
export function rutasPerfil(bd: BaseDatos): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    const usuario = await bd.usuario.findUnique({
      where: { id: res.locals.usuarioId as number },
      select: seleccionPublica,
    });
    if (!usuario) throw sesionInvalida();
    res.json({ usuario: aPublico(usuario) });
  });

  router.patch('/', async (req, res) => {
    const datos = esquemaActualizarPerfil.parse(req.body);
    try {
      const usuario = await bd.usuario.update({
        where: { id: res.locals.usuarioId as number },
        data: datos,
        select: seleccionPublica,
      });
      res.json({ usuario: aPublico(usuario) });
    } catch (error) {
      // P2025: el usuario ya no existe aunque el token siga vigente
      if ((error as { code?: unknown }).code === 'P2025') throw sesionInvalida();
      throw error;
    }
  });

  return router;
}
