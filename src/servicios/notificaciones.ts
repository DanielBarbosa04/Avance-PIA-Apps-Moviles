import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { MENSAJES_DESCANSO, MENSAJES_ENTRENAMIENTO } from '@/datos/mensajes-motivacionales';

const CLAVE_AJUSTES = 'dynamd:ajustes-recordatorios';
const CANAL_ANDROID = 'recordatorios';
const DIAS_A_PROGRAMAR = 14;

export type AjustesRecordatorios = {
  activo: boolean;
  hora: number; // 0-23
  minuto: number; // 0-59
  diasEntrenamiento: number[]; // 0 = domingo, 6 = sabado
};

export const AJUSTES_INICIALES: AjustesRecordatorios = {
  activo: false,
  hora: 18,
  minuto: 0,
  diasEntrenamiento: [1, 2, 3, 4, 5],
};

//como se muestra una notificacion si llega con la app abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function cargarAjustes(): Promise<AjustesRecordatorios> {
  try {
    const crudo = await AsyncStorage.getItem(CLAVE_AJUSTES);
    if (!crudo) return AJUSTES_INICIALES;
    return { ...AJUSTES_INICIALES, ...(JSON.parse(crudo) as Partial<AjustesRecordatorios>) };
  } catch {
    return AJUSTES_INICIALES;
  }
}

export async function guardarAjustes(ajustes: AjustesRecordatorios): Promise<void> {
  await AsyncStorage.setItem(CLAVE_AJUSTES, JSON.stringify(ajustes));
}

async function prepararCanalAndroid(): Promise<void> {
  if (Platform.OS === 'android') {
    // Android necesita al menos un canal para mostrar la solicitud de permiso.
    await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: 'Recordatorios de DynaMD',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function tienePermiso(): Promise<boolean> {
  const estado = await Notifications.getPermissionsAsync();
  return estado.granted;
}

/** Pide el permiso en el momento en que el usuario activa los recordatorios. */
export async function pedirPermiso(): Promise<boolean> {
  await prepararCanalAndroid();
  const actual = await Notifications.getPermissionsAsync();
  if (actual.granted) return true;
  if (!actual.canAskAgain) return false;
  const respuesta = await Notifications.requestPermissionsAsync();
  return respuesta.granted;
}

function elegirMensaje(lista: readonly string[]): string {
  return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Cancela lo programado y programa los proximos dias con un mensaje al azar
 * Devuelve cuantas notificaciones quedaron programadas
 */
export async function reprogramarRecordatorios(ajustes: AjustesRecordatorios): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!ajustes.activo) return 0;

  const ahora = new Date();
  let programadas = 0;

  for (let i = 0; i < DIAS_A_PROGRAMAR; i++) {
    const fecha = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate() + i,
      ajustes.hora,
      ajustes.minuto,
      0,
      0,
    );
    if (fecha.getTime() <= ahora.getTime()) continue;

    const entrena = ajustes.diasEntrenamiento.includes(fecha.getDay());
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'DynaMD',
        body: elegirMensaje(entrena ? MENSAJES_ENTRENAMIENTO : MENSAJES_DESCANSO),
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fecha },
    });
    programadas++;
  }
  return programadas;
}

/** Notificación de prueba que llega en 5 segundos
 * Cada vez que se abre la pantalla se reprograma una ventana de 14 dias. si el usuario no abre la 
 * app en dos semanas, se acaban los recordatorios (tipo duolingo)
*/
export async function programarPrueba(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title: 'DynaMD', body: elegirMensaje(MENSAJES_ENTRENAMIENTO) },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
  });
}