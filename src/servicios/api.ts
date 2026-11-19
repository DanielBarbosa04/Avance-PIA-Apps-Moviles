// Cliente del backend de DynaMD. La dirección viene de EXPO_PUBLIC_API_URL
// (archivo .env de la raíz). Desde un teléfono físico NO sirve "localhost":
// usa la IP de la PC en la misma red, por ejemplo http://192.168.1.50:3000
const URL_BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const TIEMPO_MAXIMO_MS = 12000;

export type SexoUsuario = 'MASCULINO' | 'FEMENINO';

export interface Usuario {
  id: number;
  correo: string;
  apodo: string;
  sexo: SexoUsuario;
  pesoKg: number;
  creadoEn: string;
}

export interface RespuestaSesion {
  token: string;
  usuario: Usuario;
}

export interface DetalleCampo {
  campo: string;
  mensaje: string;
}

export class ErrorApi extends Error {
  constructor(
    public readonly estado: number,
    public readonly codigo: string,
    mensaje: string,
    public readonly detalles?: DetalleCampo[],
  ) {
    super(mensaje);
    this.name = 'ErrorApi';
  }
}

interface Opciones {
  metodo?: 'GET' | 'POST' | 'PATCH';
  cuerpo?: unknown;
  token?: string | null;
}

async function pedir<T>(ruta: string, { metodo = 'GET', cuerpo, token }: Opciones = {}): Promise<T> {
  if (!URL_BASE) {
    throw new ErrorApi(
      0,
      'SIN_CONFIGURAR',
      'Falta EXPO_PUBLIC_API_URL en el archivo .env de la raíz del proyecto.',
    );
  }

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: metodo,
      signal: controlador.signal,
      headers: {
        Accept: 'application/json',
        ...(cuerpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi(
      0,
      'SIN_CONEXION',
      'No se pudo conectar con el servidor. Revisa tu red y que el backend esté encendido.',
    );
  } finally {
    clearTimeout(temporizador);
  }

  let json: any = null;
  try {
    json = await respuesta.json();
  } catch {
    // Respuesta sin JSON: se maneja abajo según el estado HTTP.
  }

  if (!respuesta.ok) {
    const e = json?.error;
    throw new ErrorApi(
      respuesta.status,
      typeof e?.codigo === 'string' ? e.codigo : 'ERROR_DESCONOCIDO',
      typeof e?.mensaje === 'string' ? e.mensaje : `Error del servidor (${respuesta.status})`,
      Array.isArray(e?.detalles) ? e.detalles : undefined,
    );
  }
  return json as T;
}

export interface DatosRegistro {
  correo: string;
  contrasena: string;
  apodo: string;
  sexo: SexoUsuario;
  pesoKg: number;
}

export const registrar = (datos: DatosRegistro) =>
  pedir<RespuestaSesion>('/api/auth/registro', { metodo: 'POST', cuerpo: datos });

export const iniciarSesionApi = (correo: string, contrasena: string) =>
  pedir<RespuestaSesion>('/api/auth/login', { metodo: 'POST', cuerpo: { correo, contrasena } });

export const obtenerPerfil = (token: string) =>
  pedir<{ usuario: Usuario }>('/api/perfil', { token });

export const actualizarPerfilApi = (
  token: string,
  datos: { apodo?: string; pesoKg?: number },
) => pedir<{ usuario: Usuario }>('/api/perfil', { metodo: 'PATCH', cuerpo: datos, token });
