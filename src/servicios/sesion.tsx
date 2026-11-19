import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  actualizarPerfilApi,
  ErrorApi,
  iniciarSesionApi,
  obtenerPerfil,
  registrar,
  type DatosRegistro,
  type Usuario,
} from '@/servicios/api';
import { borrarSesion, guardarSesion, leerSesion, type SesionGuardada } from '@/servicios/almacen-sesion';

interface ContextoSesion {
  /** true mientras se lee el almacén seguro al abrir la app. */
  cargando: boolean;
  usuario: Usuario | null;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  actualizarPerfil: (datos: { apodo?: string; pesoKg?: number }) => Promise<void>;
}

const Contexto = createContext<ContextoSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState<SesionGuardada | null>(null);
  // Token vigente, para ignorar respuestas tardías de una sesión anterior.
  const tokenActual = useRef<string | null>(null);

  const aplicar = useCallback(async (nueva: SesionGuardada | null) => {
    tokenActual.current = nueva?.token ?? null;
    setSesion(nueva);
    if (nueva) await guardarSesion(nueva);
    else await borrarSesion();
  }, []);

  const cerrarSesion = useCallback(() => aplicar(null), [aplicar]);

  // Al abrir la app: se restaura la sesión y se valida en segundo plano.
  useEffect(() => {
    let activo = true;
    (async () => {
      const guardada = await leerSesion();
      if (!activo) return;
      tokenActual.current = guardada?.token ?? null;
      setSesion(guardada);
      setCargando(false);
      if (!guardada) return;
      try {
        const { usuario } = await obtenerPerfil(guardada.token);
        if (activo && tokenActual.current === guardada.token) {
          await aplicar({ token: guardada.token, usuario });
        }
      } catch (e) {
        // Sesión vencida o usuario inexistente: se cierra. Sin red: se conserva.
        if (e instanceof ErrorApi && e.estado === 401 && tokenActual.current === guardada.token) {
          await aplicar(null);
        }
      }
    })();
    return () => {
      activo = false;
    };
  }, [aplicar]);

  const iniciarSesion = useCallback(
    async (correo: string, contrasena: string) => {
      await aplicar(await iniciarSesionApi(correo, contrasena));
    },
    [aplicar],
  );

  const registrarse = useCallback(
    async (datos: DatosRegistro) => {
      await aplicar(await registrar(datos));
    },
    [aplicar],
  );

  const actualizarPerfil = useCallback(
    async (datos: { apodo?: string; pesoKg?: number }) => {
      if (!sesion) throw new ErrorApi(401, 'NO_AUTORIZADO', 'Sesión inválida o vencida');
      try {
        const { usuario } = await actualizarPerfilApi(sesion.token, datos);
        await aplicar({ token: sesion.token, usuario });
      } catch (e) {
        if (e instanceof ErrorApi && e.estado === 401) await aplicar(null);
        throw e;
      }
    },
    [aplicar, sesion],
  );

  const valor = useMemo<ContextoSesion>(
    () => ({
      cargando,
      usuario: sesion?.usuario ?? null,
      iniciarSesion,
      registrarse,
      cerrarSesion,
      actualizarPerfil,
    }),
    [cargando, sesion, iniciarSesion, registrarse, cerrarSesion, actualizarPerfil],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): ContextoSesion {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return valor;
}
