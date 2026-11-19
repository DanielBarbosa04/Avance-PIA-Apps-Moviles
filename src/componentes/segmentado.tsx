import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/componentes/themed-text';
import { Spacing } from '@/estilos/theme';
import { useTheme } from '@/hooks/use-theme';

interface Props<T extends string> {
  opciones: { valor: T; etiqueta: string }[];
  valor: T | null;
  onCambio: (valor: T) => void;
}

export function Segmentado<T extends string>({ opciones, valor, onCambio }: Props<T>) {
  const tema = useTheme();
  return (
    <View style={[styles.fila, { backgroundColor: tema.backgroundElement, borderColor: tema.borde }]}>
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            onPress={() => onCambio(o.valor)}
            style={[styles.opcion, activo && { backgroundColor: tema.acento }]}>
            <ThemedText
              type="smallBold"
              style={{ color: activo ? tema.textoSobreAcento : tema.text, fontSize: 15 }}>
              {o.etiqueta}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  opcion: {
    flex: 1,
    minHeight: 44,
    borderRadius: Spacing.three - Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
