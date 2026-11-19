import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import type { BaseDatos } from '../app';
import { esquemaLogin, esquemaRegistro } from '../validacion/esquemas';
import { hashearContrasena, hashDeRelleno, verificarContrasena } from '../utils/contrasena';
import { ErrorApp } from '../utils/errores';
import { firmarToken } from '../utils/token';
import { aPublico, seleccionPublica } from '../utils/usuario-publico';

const correoEnUso = () =>
  new ErrorApp(409, 'CORREO_EN_USO', 'Ese correo ya está registrado');

const esViolacionUnica = (e: unknown) =>
  typeof e === 'object' && e !== null && (e as { code?: unknown }).code === 'P2002';

export function rutasAuth(bd: BaseDatos, secreto: string, limite: number): Router {
  const router = Router();

  // Frena la fuerza bruta: máximo `limite` intentos por IP cada 15 minutos.
  router.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: limite,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      handler: (_req, _res, next) =>
        next(new ErrorApp(429, 'DEMASIADAS_PETICIONES', 'Demasiados intentos, espera unos minutos')),
    }),
  );

  router.post('/registro', async (req, res) => {
    const datos = esquemaRegistro.parse(req.body);

    if (await bd.usuario.findUnique({ where: { correo: datos.correo }, select: { id: true } })) {
      throw correoEnUso();
    }

    const contrasenaHash = await hashearContrasena(datos.contrasena);
    try {
      const usuario = await bd.usuario.create({
        data: {
          correo: datos.correo,
          contrasenaHash,
          apodo: datos.apodo,
          sexo: datos.sexo,
          pesoKg: datos.pesoKg,
        },
        select: seleccionPublica,
      });
      res.status(201).json({ token: firmarToken(usuario.id, secreto), usuario: aPublico(usuario) });
    } catch (error) {
      if (esViolacionUnica(error)) throw correoEnUso();
      throw error;
    }
  });

  router.post('/login', async (req, res) => {
    const { correo, contrasena } = esquemaLogin.parse(req.body);

    const usuario = await bd.usuario.findUnique({ where: { correo } });
    // Siempre se calcula un hash, exista o no el usuario, y el error es el mismo.
    const valida = await verificarContrasena(
      contrasena,
      usuario?.contrasenaHash ?? (await hashDeRelleno()),
    );
    if (!usuario || !valida) {
      throw new ErrorApp(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos');
    }

    res.json({ token: firmarToken(usuario.id, secreto), usuario: aPublico(usuario) });
  });

  return router;
}
