import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/componentes/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/estilos/theme';

interface Props {
  children: ReactNode;
  /** Deja espacio abajo para la barra de pestañas. */
  conTabs?: boolean;
  /** Deja espacio arriba para el logo fijo de la esquina. */
  conLogo?: boolean;
}

export function Pantalla({ children, conTabs = false, conLogo = false }: Props) {
  return (
    <ThemedView style={styles.contenedor}>
      <SafeAreaView style={styles.area}>
        <KeyboardAvoidingView
          style={styles.area}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={[
              styles.contenido,
              {
                paddingTop: conLogo ? 56 : Spacing.three,
                paddingBottom: (conTabs ? BottomTabInset : 0) + Spacing.four,
              },
            ]}>
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  area: { flex: 1, maxWidth: MaxContentWidth },
  contenido: { gap: Spacing.three, paddingHorizontal: Spacing.four },
});
