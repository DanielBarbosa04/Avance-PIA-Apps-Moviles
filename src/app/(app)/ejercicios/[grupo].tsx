import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { EtiquetaNivel } from '@/componentes/etiqueta-nivel';
import { Pantalla } from '@/componentes/pantalla';
import { ThemedText } from '@/componentes/themed-text';
import { ThemedView } from '@/componentes/themed-view';
import { ejerciciosDeGrupo } from '@/datos/ejercicios';
import { esGrupoValido, nombreDeGrupo } from '@/datos/grupos-musculares';
import { IMAGENES_EJERCICIOS } from '@/datos/imagenes-ejercicios';
import { Spacing } from '@/estilos/theme';
import { useTheme } from '@/hooks/use-theme';

export default function EjerciciosDelGrupo() {
  const tema = useTheme();
  const router = useRouter();
  const { grupo } = useLocalSearchParams<{ grupo: string }>();

  if (!grupo || !esGrupoValido(grupo)) {
    return (
      <Pantalla>
        <Stack.Screen options={{ title: 'Ejercicios' }} />
        <ThemedText>Ese grupo muscular no existe.</ThemedText>
      </Pantalla>
    );
  }

  const ejercicios = ejerciciosDeGrupo(grupo);

  return (
    <Pantalla>
      <Stack.Screen options={{ title: nombreDeGrupo(grupo) }} />
      <ThemedText type="small" themeColor="textSecondary">
        Un ejercicio por nivel. El nivel se refiere a tu experiencia en el gimnasio.
      </ThemedText>

      {ejercicios.map((e) => (
        <Pressable
          key={e.id}
          accessibilityRole="button"
          accessibilityLabel={`${e.nombre}, nivel ${e.nivel}`}
          onPress={() => router.push({ pathname: '/ejercicio/[id]', params: { id: e.id } })}>
          <ThemedView
            type="backgroundElement"
            style={[styles.tarjeta, { borderColor: tema.borde }]}>
            <Image
              source={IMAGENES_EJERCICIOS[e.id]}
              contentFit="cover"
              style={styles.miniatura}
              accessibilityLabel={`Ilustración de ${e.nombre}`}
            />
            <View style={styles.texto}>
              <EtiquetaNivel nivel={e.nivel} />
              <ThemedText type="smallBold" style={styles.nombre}>
                {e.nombre}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {e.series} · descanso {e.descanso}
              </ThemedText>
            </View>
          </ThemedView>
        </Pressable>
      ))}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.two + 2,
    alignItems: 'center',
  },
  miniatura: { width: 92, height: 92, borderRadius: Spacing.two + 2 },
  texto: { flex: 1, gap: Spacing.one + 2 },
  nombre: { fontSize: 16, lineHeight: 22 },
});
