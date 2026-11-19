// La sesión (token + datos del usuario) se guarda cifrada con Expo SecureStore.
// NO se usa AsyncStorage para esto: AsyncStorage guarda en texto plano.
import * as SecureStore from 'expo-secure-store';

import type { Usuario } from '@/servicios/api';

const CLAVE = 'dynamd.sesion';

export interface SesionGuardada {
  token: string;
  usuario: Usuario;
}

export async function leerSesion(): Promise<SesionGuardada | null> {
  try {
    const texto = await SecureStore.getItemAsync(CLAVE);
    if (!texto) return null;
    const datos = JSON.parse(texto);
    if (typeof datos?.token !== 'string' || typeof datos?.usuario?.id !== 'number') {
      await SecureStore.deleteItemAsync(CLAVE);
      return null;
    }
    return datos as SesionGuardada;
  } catch {
    return null;
  }
}

export async function guardarSesion(sesion: SesionGuardada): Promise<void> {
  await SecureStore.setItemAsync(CLAVE, JSON.stringify(sesion));
}

export async function borrarSesion(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CLAVE);
  } catch {
    // Si falla el borrado, la sesión en memoria ya se cerró igualmente.
  }
}
