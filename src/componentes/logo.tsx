import { Image, StyleSheet, View } from 'react-native';

type LogoProps = {
  /** Ancho del logo en puntos. El alto se calcula según la proporción de la imagen. */
  ancho?: number;
};

const PROPORCION = 1219 / 356; // ancho / alto de logotipo-dmd.png

export function Logo({ ancho = 160 }: LogoProps) {
  return (
    <View style={styles.contenedor}>
      <Image
        source={require('../../assets/images/logotipo-dmd.png')}
        style={{ width: ancho, height: ancho / PROPORCION, resizeMode: 'contain' }}
        accessibilityLabel="Logotipo de DynaMD"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { alignItems: 'center' },
});