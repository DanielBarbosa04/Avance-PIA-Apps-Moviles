// Pruebas con una BD FALSA en memoria: verifican validación, hash, JWT,
// autenticación y errores. NO prueban MySQL ni Prisma reales.
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, describe, test } from 'node:test';

import jwt from 'jsonwebtoken';

import { crearApp, type BaseDatos } from '../src/app';
import { leerConfiguracion } from '../src/utils/configuracion';
import { hashearContrasena, verificarContrasena } from '../src/utils/contrasena';
import { verificarToken } from '../src/utils/token';

const SECRETO = 'x'.repeat(40);
const entorno = {
  DATABASE_HOST: 'localhost',
  DATABASE_USER: 'u',
  DATABASE_PASSWORD: 'p',
  DATABASE_NAME: 'd',
  JWT_SECRET: SECRETO,
  LIMITE_AUTH_15MIN: '1000',
};

function crearBdFalsa() {
  const filas: any[] = [];
  const bd = {
    usuario: {
      findUnique: async ({ where, select }: any) => {
        const f = filas.find((u) => (where.correo ? u.correo === where.correo : u.id === where.id));
        if (!f) return null;
        if (!select) return { ...f };
        return Object.fromEntries(Object.keys(select).map((k) => [k, f[k]]));
      },
      create: async ({ data, select }: any) => {
        const f = { id: filas.length + 1, creadoEn: new Date(), ...data };
        filas.push(f);
        return Object.fromEntries(Object.keys(select).map((k) => [k, f[k]]));
      },
      update: async ({ where, data, select }: any) => {
        const f = filas.find((u) => u.id === where.id);
        if (!f) throw Object.assign(new Error('no existe'), { code: 'P2025' });
        Object.assign(f, data);
        return Object.fromEntries(Object.keys(select).map((k) => [k, f[k]]));
      },
    },
  };
  return { bd: bd as unknown as BaseDatos, filas };
}

async function levantar(env: Record<string, string> = entorno) {
  const { bd, filas } = crearBdFalsa();
  const servidor = crearApp(bd, leerConfiguracion(env as NodeJS.ProcessEnv)).listen(0);
  after(() => servidor.close());
  const base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;
  const pedir = async (ruta: string, metodo = 'GET', cuerpo?: unknown, token?: string) => {
    const r = await fetch(base + ruta, {
      method: metodo,
      headers: {
        ...(cuerpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: typeof cuerpo === 'string' ? cuerpo : cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    return { estado: r.status, json: (await r.json()) as any };
  };
  return { pedir, filas };
}

const registroValido = {
  correo: 'Ana@Correo.com ',
  contrasena: 'clave-segura-123',
  apodo: 'Ana',
  sexo: 'FEMENINO',
  pesoKg: 60.456,
};

describe('configuración', () => {
  test('acepta una configuración válida', () => {
    assert.equal(leerConfiguracion(entorno as NodeJS.ProcessEnv).PORT, 3000);
  });
  test('rechaza JWT_SECRET corto sin mostrar su valor', () => {
    assert.throws(
      () => leerConfiguracion({ ...entorno, JWT_SECRET: 'corto' } as NodeJS.ProcessEnv),
      (e: Error) => e.message.includes('JWT_SECRET') && !e.message.includes('corto'),
    );
  });
});

describe('contraseña y token', () => {
  test('hash correcto, incorrecto y distinto por sal', async () => {
    const h1 = await hashearContrasena('abc123456789');
    const h2 = await hashearContrasena('abc123456789');
    assert.match(h1, /^argon2id\$m=19456,t=2,p=1\$/);
    assert.notEqual(h1, h2);
    assert.equal(await verificarContrasena('abc123456789', h1), true);
    assert.equal(await verificarContrasena('otra-clave-123', h1), false);
    assert.equal(await verificarContrasena('x', 'basura'), false);
  });
  test('token: rechaza vencido, otro secreto y alg none', () => {
    const vencido = jwt.sign({}, SECRETO, { subject: '1', expiresIn: -10 });
    const ajeno = jwt.sign({}, 'y'.repeat(40), { subject: '1' });
    const sinFirma = jwt.sign({}, '', { subject: '1', algorithm: 'none' });
    for (const t of [vencido, ajeno, sinFirma, 'no-es-token']) {
      assert.throws(() => verificarToken(t, SECRETO), { codigo: 'NO_AUTORIZADO' });
    }
    assert.equal(verificarToken(jwt.sign({}, SECRETO, { subject: '7' }), SECRETO), 7);
  });
});

describe('API', () => {
  test('registro: 201, normaliza correo, redondea peso, sin hash en la respuesta', async () => {
    const { pedir, filas } = await levantar();
    const r = await pedir('/api/auth/registro', 'POST', registroValido);
    assert.equal(r.estado, 201);
    assert.equal(r.json.usuario.correo, 'ana@correo.com');
    assert.equal(r.json.usuario.pesoKg, 60.46);
    assert.ok(r.json.token);
    assert.ok(!JSON.stringify(r.json).includes('contrasenaHash'));
    assert.ok(filas[0].contrasenaHash.startsWith('argon2id$'));
    assert.ok(!JSON.stringify(filas).includes('clave-segura-123'));
  });

  test('registro: correo repetido 409; datos inválidos 400 con formato uniforme', async () => {
    const { pedir } = await levantar();
    await pedir('/api/auth/registro', 'POST', registroValido);
    const dup = await pedir('/api/auth/registro', 'POST', registroValido);
    assert.equal(dup.estado, 409);
    assert.equal(dup.json.error.codigo, 'CORREO_EN_USO');
    const mal = await pedir('/api/auth/registro', 'POST', { correo: 'x', contrasena: '1', sexo: 'OTRO' });
    assert.equal(mal.estado, 400);
    assert.equal(mal.json.error.codigo, 'VALIDACION');
    assert.ok(Array.isArray(mal.json.error.detalles));
    const sinCuerpo = await pedir('/api/auth/registro', 'POST');
    assert.equal(sinCuerpo.estado, 400);
    const jsonRoto = await pedir('/api/auth/registro', 'POST', '{roto');
    assert.equal(jsonRoto.estado, 400);
    assert.equal(jsonRoto.json.error.codigo, 'PETICION_INVALIDA');
  });

  test('login: correcto 200; contraseña mala y correo inexistente dan la MISMA respuesta', async () => {
    const { pedir } = await levantar();
    await pedir('/api/auth/registro', 'POST', registroValido);
    const ok = await pedir('/api/auth/login', 'POST', { correo: 'ana@correo.com', contrasena: 'clave-segura-123' });
    assert.equal(ok.estado, 200);
    assert.ok(ok.json.token);
    const mala = await pedir('/api/auth/login', 'POST', { correo: 'ana@correo.com', contrasena: 'incorrecta-123' });
    const noExiste = await pedir('/api/auth/login', 'POST', { correo: 'nadie@correo.com', contrasena: 'incorrecta-123' });
    assert.equal(mala.estado, 401);
    assert.deepEqual(mala.json, noExiste.json);
    assert.equal(noExiste.estado, 401);
  });

  test('perfil: exige token, devuelve solo el propio usuario y permite editar', async () => {
    const { pedir } = await levantar();
    const a = await pedir('/api/auth/registro', 'POST', registroValido);
    const b = await pedir('/api/auth/registro', 'POST', { ...registroValido, correo: 'luis@correo.com', apodo: 'Luis' });
    assert.equal((await pedir('/api/perfil')).estado, 401);
    assert.equal((await pedir('/api/perfil', 'GET', undefined, 'basura')).estado, 401);
    assert.equal((await pedir('/api/perfil', 'GET', undefined, a.json.token)).json.usuario.apodo, 'Ana');
    assert.equal((await pedir('/api/perfil', 'GET', undefined, b.json.token)).json.usuario.apodo, 'Luis');
    const cambio = await pedir('/api/perfil', 'PATCH', { pesoKg: 70 }, a.json.token);
    assert.equal(cambio.json.usuario.pesoKg, 70);
    // Luis no se ve afectado por el cambio de Ana
    assert.equal((await pedir('/api/perfil', 'GET', undefined, b.json.token)).json.usuario.pesoKg, 60.46);
    // No se puede cambiar correo, sexo ni id; PATCH vacío tampoco
    assert.equal((await pedir('/api/perfil', 'PATCH', { correo: 'otro@x.com' }, a.json.token)).estado, 400);
    assert.equal((await pedir('/api/perfil', 'PATCH', { id: 2 }, a.json.token)).estado, 400);
    assert.equal((await pedir('/api/perfil', 'PATCH', {}, a.json.token)).estado, 400);
  });

  test('token válido de un usuario que ya no existe da 401', async () => {
    const { pedir } = await levantar();
    const fantasma = jwt.sign({}, SECRETO, { subject: '999', expiresIn: '1h' });
    assert.equal((await pedir('/api/perfil', 'GET', undefined, fantasma)).estado, 401);
    assert.equal((await pedir('/api/perfil', 'PATCH', { apodo: 'Zoe' }, fantasma)).estado, 401);
  });

  test('ruta inexistente 404 uniforme y límite de intentos 429', async () => {
    const { pedir } = await levantar({ ...entorno, LIMITE_AUTH_15MIN: '3' });
    assert.equal((await pedir('/api/nada')).json.error.codigo, 'NO_ENCONTRADO');
    const intento = { correo: 'a@b.com', contrasena: 'x' };
    const estados: number[] = [];
    for (let i = 0; i < 5; i++) estados.push((await pedir('/api/auth/login', 'POST', intento)).estado);
    assert.deepEqual(estados, [401, 401, 401, 429, 429]);
  });
});
