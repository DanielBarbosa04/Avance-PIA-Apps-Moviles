import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/componentes/themed-text';
import { ThemedView } from '@/componentes/themed-view';
import { Colors, Spacing } from '@/estilos/theme';
import {
    AJUSTES_INICIALES,
    cargarAjustes,
    guardarAjustes,
    pedirPermiso,
    programarPrueba,
    reprogramarRecordatorios,
    tienePermiso,
    type AjustesRecordatorios,
} from '@/servicios/notificaciones';

const DIAS = [
  { valor: 1, etiqueta: 'L', nombre: 'Lunes' },
  { valor: 2, etiqueta: 'M', nombre: 'Martes' },
  { valor: 3, etiqueta: 'X', nombre: 'Miércoles' },
  { valor: 4, etiqueta: 'J', nombre: 'Jueves' },
  { valor: 5, etiqueta: 'V', nombre: 'Viernes' },
  { valor: 6, etiqueta: 'S', nombre: 'Sábado' },
  { valor: 0, etiqueta: 'D', nombre: 'Domingo' },
];

function dosDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

export function Recordatorios() {
  const tema = useColorScheme() === 'light' ? Colors.light : Colors.dark;
  const [ajustes, setAjustes] = useState<AjustesRecordatorios>(AJUSTES_INICIALES);
  const [cargando, setCargando] = useState(true);
  const [programadas, setProgramadas] = useState(0);

  useEffect(() => {
    let activo = true;
    (async () => {
      let guardados = await cargarAjustes();
      if (guardados.activo && !(await tienePermiso())) {
        guardados = { ...guardados, activo: false };
        await guardarAjustes(guardados);
      }
      const total = await reprogramarRecordatorios(guardados);
      if (activo) {
        setAjustes(guardados);
        setProgramadas(total);
        setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  async function aplicar(nuevos: AjustesRecordatorios) {
    setAjustes(nuevos);
    await guardarAjustes(nuevos);
    setProgramadas(await reprogramarRecordatorios(nuevos));
  }

  function avisarSinPermiso() {
    Alert.alert(
      'Permiso necesario',
      'Para enviarte recordatorios, activa las notificaciones de la app en los ajustes del teléfono.',
      [
        { text: 'Ahora no', style: 'cancel' },
        { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
      ],
    );
  }

  async function cambiarActivo(valor: boolean) {
    if (valor && !(await pedirPermiso())) {
      avisarSinPermiso();
      return;
    }
    await aplicar({ ...ajustes, activo: valor });
  }

  async function enviarPrueba() {
    if (!(await pedirPermiso())) {
      avisarSinPermiso();
      return;
    }
    await programarPrueba();
    Alert.alert('Prueba enviada', 'La notificación llegará en unos 5 segundos.');
  }

  function alternarDia(dia: number) {
    const dias = ajustes.diasEntrenamiento.includes(dia)
      ? ajustes.diasEntrenamiento.filter((d) => d !== dia)
      : [...ajustes.diasEntrenamiento, dia];
    aplicar({ ...ajustes, diasEntrenamiento: dias });
  }

  function cambiarHora(delta: number) {
    aplicar({ ...ajustes, hora: (ajustes.hora + delta + 24) % 24 });
  }

  function cambiarMinuto(delta: number) {
    aplicar({ ...ajustes, minuto: (ajustes.minuto + delta + 60) % 60 });
  }

  if (cargando) {
    return <ThemedText type="small">Cargando ajustes...</ThemedText>;
  }

  return (
    <ThemedView type="backgroundElement" style={styles.tarjeta}>
      <View style={styles.fila}>
        <ThemedText>Recordatorios diarios</ThemedText>
        <Switch
          value={ajustes.activo}
          onValueChange={cambiarActivo}
          trackColor={{ true: tema.acento }}
          accessibilityLabel="Activar recordatorios diarios"
        />
      </View>

      <ThemedText type="small">Hora del recordatorio</ThemedText>
      <View style={styles.filaHora}>
        <Selector etiqueta="hora" valor={dosDigitos(ajustes.hora)} onMenos={() => cambiarHora(-1)} onMas={() => cambiarHora(1)} />
        <ThemedText type="title" style={styles.separador}>:</ThemedText>
        <Selector etiqueta="minutos" valor={dosDigitos(ajustes.minuto)} onMenos={() => cambiarMinuto(-5)} onMas={() => cambiarMinuto(5)} />
      </View>

      <ThemedText type="small">Días en que entrenas (los demás son de descanso)</ThemedText>
      <View style={styles.filaDias}>
        {DIAS.map((dia) => {
          const elegido = ajustes.diasEntrenamiento.includes(dia.valor);
          return (
            <Pressable
              key={dia.valor}
              onPress={() => alternarDia(dia.valor)}
              accessibilityRole="button"
              accessibilityLabel={`${dia.nombre}: ${elegido ? 'día de entrenamiento' : 'día de descanso'}`}
              style={[
                styles.dia,
                { backgroundColor: elegido ? tema.acento : 'transparent', borderColor: tema.borde },
              ]}>
              <ThemedText style={{ color: elegido ? tema.textoSobreAcento : tema.text }}>{dia.etiqueta}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      {ajustes.activo && (
        <ThemedText type="small">
          {programadas} recordatorios programados para los próximos días.
        </ThemedText>
      )}

      <Pressable
        onPress={enviarPrueba}
        accessibilityRole="button"
        style={[styles.botonPrueba, { backgroundColor: tema.acento }]}>
        <ThemedText style={{ color: tema.textoSobreAcento }}>Enviar notificación de prueba</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

type SelectorProps = {
  etiqueta: string;
  valor: string;
  onMenos: () => void;
  onMas: () => void;
};

function Selector({ etiqueta, valor, onMenos, onMas }: SelectorProps) {
  const tema = useColorScheme() === 'light' ? Colors.light : Colors.dark;
  return (
    <View style={styles.selector}>
      <Pressable onPress={onMas} accessibilityRole="button" accessibilityLabel={`Subir ${etiqueta}`} style={[styles.paso, { borderColor: tema.borde }]}>
        <ThemedText>+</ThemedText>
      </Pressable>
      <ThemedText type="title" style={styles.valor}>{valor}</ThemedText>
      <Pressable onPress={onMenos} accessibilityRole="button" accessibilityLabel={`Bajar ${etiqueta}`} style={[styles.paso, { borderColor: tema.borde }]}>
        <ThemedText>−</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    alignSelf: 'stretch',
  },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filaHora: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  filaDias: { flexDirection: 'row', justifyContent: 'space-between' },
  selector: { alignItems: 'center', gap: Spacing.one },
  paso: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valor: { fontSize: 36, lineHeight: 44 },
  separador: { fontSize: 36, lineHeight: 44 },
  dia: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPrueba: {
    minHeight: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
});