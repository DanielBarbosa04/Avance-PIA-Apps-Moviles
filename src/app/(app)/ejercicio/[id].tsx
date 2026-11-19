import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EtiquetaNivel } from '@/componentes/etiqueta-nivel';
import { Pantalla } from '@/componentes/pantalla';
import { ThemedText } from '@/componentes/themed-text';
import { ThemedView } from '@/componentes/themed-view';
import { buscarEjercicio } from '@/datos/ejercicios';
import { nombreDeGrupo } from '@/datos/grupos-musculares';
import { IMAGENES_EJERCICIOS } from '@/datos/imagenes-ejercicios';
import { Spacing } from '@/estilos/theme';
import { useTheme } from '@/hooks/use-theme';

export default function DetalleEjercicio() {
  const tema = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ejercicio = id ? buscarEjercicio(id) : undefined;

  if (!ejercicio) {
    return (
      <Pantalla>
        <Stack.Screen options={{ title: 'Ejercicio' }} />
        <ThemedText>No se encontró ese ejercicio.</ThemedText>
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <Stack.Screen options={{ title: nombreDeGrupo(ejercicio.grupo) }} />

      <Image
        source={IMAGENES_EJERCICIOS[ejercicio.id]}
        contentFit="contain"
        style={[styles.imagen, { backgroundColor: tema.backgroundElement }]}
        accessibilityLabel={`Ilustración de ${ejercicio.nombre}`}
      />

      <View style={styles.encabezado}>
        <EtiquetaNivel nivel={ejercicio.nivel} />
        <ThemedText type="subtitle" style={styles.nombre}>
          {ejercicio.nombre}
        </ThemedText>
      </View>

      <View style={styles.fila}>
        <ThemedView type="backgroundElement" style={[styles.dato, { borderColor: tema.borde }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Series y repeticiones
          </ThemedText>
          <ThemedText type="smallBold" style={styles.valor}>
            {ejercicio.series}
          </ThemedText>
        </ThemedView>
        <ThemedView type="backgroundElement" style={[styles.dato, { borderColor: tema.borde }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Descanso
          </ThemedText>
          <ThemedText type="smallBold" style={styles.valor}>
            {ejercicio.descanso}
          </ThemedText>
        </ThemedView>
      </View>

      <Seccion titulo="Equipo">
        <ThemedText>{ejercicio.equipo}</ThemedText>
      </Seccion>

      <Seccion titulo="Músculos">
        <ThemedText>
          <ThemedText type="smallBold" style={styles.base}>
            Principal:{' '}
          </ThemedText>
          {ejercicio.musculoPrincipal}
        </ThemedText>
        {ejercicio.musculosSecundarios ? (
          <ThemedText>
            <ThemedText type="smallBold" style={styles.base}>
              Secundarios:{' '}
            </ThemedText>
            {ejercicio.musculosSecundarios}
          </ThemedText>
        ) : null}
      </Seccion>

      <Seccion titulo="Pasos">
        {ejercicio.pasos.map((paso, i) => (
          <View key={i} style={styles.paso}>
            <View style={[styles.numero, { backgroundColor: tema.acento }]}>
              <ThemedText type="smallBold" style={{ color: tema.textoSobreAcento }}>
                {i + 1}
              </ThemedText>
            </View>
            <ThemedText style={styles.textoPaso}>{paso}</ThemedText>
          </View>
        ))}
      </Seccion>

      <Seccion titulo="Advertencias">
        {ejercicio.advertencias.map((a, i) => (
          <View key={i} style={styles.paso}>
            <ThemedText style={[styles.vineta, { color: tema.peligro }]}>•</ThemedText>
            <ThemedText style={styles.textoPaso}>{a}</ThemedText>
          </View>
        ))}
      </Seccion>

      <ThemedText type="small" themeColor="textSecondary">
        Usa un peso con el que las últimas 1–2 repeticiones sean exigentes pero con buena técnica.
        Empieza ligero y sube la carga de forma gradual.
      </ThemedText>
    </Pantalla>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.seccion}>
      <ThemedText type="smallBold" style={styles.tituloSeccion}>
        {titulo}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  imagen: { width: '100%', aspectRatio: 4 / 3, borderRadius: Spacing.three },
  encabezado: { gap: Spacing.two },
  nombre: { fontSize: 26, lineHeight: 34 },
  fila: { flexDirection: 'row', gap: Spacing.three },
  dato: {
    flex: 1,
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  valor: { fontSize: 18, lineHeight: 24 },
  seccion: { gap: Spacing.two },
  tituloSeccion: { fontSize: 18, lineHeight: 24 },
  base: { fontSize: 16, lineHeight: 24 },
  paso: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  numero: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  textoPaso: { flex: 1 },
  vineta: { width: 26, textAlign: 'center', fontSize: 20, lineHeight: 24 },
});
