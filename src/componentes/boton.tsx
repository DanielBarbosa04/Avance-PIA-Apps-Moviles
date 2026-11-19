import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/componentes/themed-text';
import { Spacing } from '@/estilos/theme';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'peligro';
  cargando?: boolean;
  deshabilitado?: boolean;
}

export function Boton({ titulo, onPress, variante = 'primario', cargando = false, deshabilitado = false }: Props) {
  const tema = useTheme();
  const inactivo = deshabilitado || cargando;

  const fondo =
    variante === 'primario' ? tema.acento : variante === 'peligro' ? 'transparent' : tema.backgroundElement;
  const colorTexto =
    variante === 'primario' ? tema.textoSobreAcento : variante === 'peligro' ? tema.peligro : tema.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      onPress={onPress}
      style={({ pressed }) => [
        styles.boton,
        {
          backgroundColor: fondo,
          borderColor: variante === 'peligro' ? tema.peligro : variante === 'secundario' ? tema.borde : fondo,
          opacity: inactivo ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}>
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <ThemedText type="smallBold" style={{ color: colorTexto, fontSize: 16 }}>
          {titulo}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 50,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
});
