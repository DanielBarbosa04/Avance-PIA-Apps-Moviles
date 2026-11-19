import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/componentes/themed-text';
import type { Nivel } from '@/datos/ejercicios';
import { Spacing } from '@/estilos/theme';
import { useTheme } from '@/hooks/use-theme';

const PUNTOS: Record<Nivel, number> = { Principiante: 1, Intermedio: 2, Avanzado: 3 };

export function EtiquetaNivel({ nivel }: { nivel: Nivel }) {
  const tema = useTheme();
  return (
    <View style={[styles.contenedor, { borderColor: tema.acento }]}>
      <View style={styles.puntos}>
        {[1, 2, 3].map((n) => (
          <View
            key={n}
            style={[styles.punto, { backgroundColor: n <= PUNTOS[nivel] ? tema.acento : tema.borde }]}
          />
        ))}
      </View>
      <ThemedText type="smallBold" style={{ fontSize: 12, lineHeight: 16 }}>
        {nivel}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.four,
    paddingVertical: 2,
    paddingHorizontal: Spacing.two + 2,
  },
  puntos: { flexDirection: 'row', gap: 3 },
  punto: { width: 6, height: 6, borderRadius: 3 },
});
