import { memo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { construirMapa, LIENZO, type Sexo, type Vista } from '@/componentes/mapa-geometria';
import type { GrupoId } from '@/datos/grupos-musculares';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  sexo: Sexo;
  vista: Vista;
  seleccionado: GrupoId | null;
  onSeleccionar: (grupo: GrupoId) => void;
}

// Mapa muscular interactivo: cada músculo es una región táctil del SVG.
function MapaMuscularBase({ sexo, vista, seleccionado, onSeleccionar }: Props) {
  const tema = useTheme();
  const { height } = useWindowDimensions();
  const mapa = construirMapa(sexo, vista);

  const alto = Math.min(Math.max(height * 0.55, 320), 560);
  const ancho = (alto * LIENZO.ancho) / LIENZO.alto;

  return (
    <View style={styles.contenedor}>
      <Svg width={ancho} height={alto} viewBox={`0 0 ${LIENZO.ancho} ${LIENZO.alto}`}>
        <G>
          {mapa.silueta.map((d, i) => (
            <Path key={i} d={d} fill={tema.backgroundElement} stroke={tema.borde} strokeWidth={1} />
          ))}
          <Circle
            cx={mapa.cabeza.cx}
            cy={mapa.cabeza.cy}
            r={mapa.cabeza.r}
            fill={tema.backgroundElement}
            stroke={tema.borde}
            strokeWidth={1}
          />
        </G>
        <G>
          {mapa.regiones.map((r) => {
            const activo = r.grupo === seleccionado;
            return (
              <Path
                key={r.grupo}
                d={r.d}
                fill={tema.acento}
                fillOpacity={activo ? 0.95 : 0.28}
                stroke={activo ? tema.text : tema.acento}
                strokeWidth={activo ? 1.6 : 0.8}
                onPress={() => onSeleccionar(r.grupo)}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

export const MapaMuscular = memo(MapaMuscularBase);

const styles = StyleSheet.create({
  contenedor: { alignItems: 'center' },
});
