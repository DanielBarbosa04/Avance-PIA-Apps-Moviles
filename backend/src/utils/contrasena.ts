import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';

// Argon2id con los parámetros mínimos recomendados por OWASP
// (m=19456 KiB, t=2, p=1). Requiere Node 24.7 o superior.
const MEMORIA = 19456;
const PASADAS = 2;
const PARALELISMO = 1;
const LONGITUD = 32;

function derivar(
  contrasena: string,
  sal: Buffer,
  memoria: number,
  pasadas: number,
  paralelismo: number,
): Promise<Buffer> {
  return new Promise((resolver, rechazar) => {
    argon2(
      'argon2id',
      {
        message: contrasena,
        nonce: sal,
        memory: memoria,
        passes: pasadas,
        parallelism: paralelismo,
        tagLength: LONGITUD,
      },
      (error, clave) => (error ? rechazar(error) : resolver(Buffer.from(clave))),
    );
  });
}

const quitarRelleno = (b: Buffer) => b.toString('base64').replace(/=+$/, '');

// Formato guardado en la BD: argon2id$m=...,t=...,p=...$sal$hash
// Guardar los parámetros permite subirlos en el futuro sin romper hashes viejos.
export async function hashearContrasena(contrasena: string): Promise<string> {
  const sal = randomBytes(16);
  const hash = await derivar(contrasena, sal, MEMORIA, PASADAS, PARALELISMO);
  return `argon2id$m=${MEMORIA},t=${PASADAS},p=${PARALELISMO}$${quitarRelleno(sal)}$${quitarRelleno(hash)}`;
}

export async function verificarContrasena(
  contrasena: string,
  almacenado: string,
): Promise<boolean> {
  const partes = almacenado.split('$');
  const parametros = /^m=(\d+),t=(\d+),p=(\d+)$/.exec(partes[1] ?? '');
  if (partes.length !== 4 || partes[0] !== 'argon2id' || !parametros) {
    return false;
  }
  const [, m, t, p] = parametros;
  const sal = Buffer.from(partes[2]!, 'base64');
  const esperado = Buffer.from(partes[3]!, 'base64');
  try {
    const calculado = await derivar(
      contrasena,
      sal,
      Number(m),
      Number(t),
      Number(p),
    );
    return (
      calculado.length === esperado.length &&
      timingSafeEqual(calculado, esperado)
    );
  } catch {
    return false;
  }
}

// Hash de relleno para que iniciar sesión con un correo que no existe
// tarde lo mismo que con uno que sí existe (evita enumerar usuarios por tiempo).
let relleno: Promise<string> | undefined;
export function hashDeRelleno(): Promise<string> {
  relleno ??= hashearContrasena(randomBytes(16).toString('hex'));
  return relleno;
}
