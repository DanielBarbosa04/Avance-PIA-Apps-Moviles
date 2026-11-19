import type { Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { ThemedText } from '@/componentes/themed-text';
import { Spacing } from '@/estilos/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  etiqueta: string;
  error?: string;
  inputRef?: Ref<TextInputInstance>;
};

export function CampoTexto({ etiqueta, error, inputRef, style, ...resto }: Props) {
  const tema = useTheme();
  return (
    <View style={styles.contenedor}>
      <ThemedText type="smallBold">{etiqueta}</ThemedText>
      <TextInput
        ref={inputRef}
        placeholderTextColor={tema.textSecondary}
        accessibilityLabel={etiqueta}
        style={[
          styles.campo,
          {
            color: tema.text,
            backgroundColor: tema.backgroundElement,
            borderColor: error ? tema.peligro : tema.borde,
          },
          style,
        ]}
        {...resto}
      />
      {error ? (
        <ThemedText type="small" style={{ color: tema.peligro }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: Spacing.one },
  campo: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
