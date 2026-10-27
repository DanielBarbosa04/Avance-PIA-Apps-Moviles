import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/componentes/logo';
import { Spacing } from '@/estilos/theme';

const ANCHO_LOGO = 76;

export function LogoEsquina() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.contenedor,
        { top: insets.top + Spacing.one + 15, left: Spacing.three },
      ]}>
      <Logo ancho={ANCHO_LOGO} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    position: 'absolute',
    zIndex: 50,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
});