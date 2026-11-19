import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Boton } from '@/componentes/boton';
import { gruposDeVista, type Vista } from '@/componentes/mapa-geometria';
import { MapaMuscular } from '@/componentes/mapa-muscular';
import { Pantalla } from '@/componentes/pantalla';
import { Segmentado } from '@/componentes/segmentado';
import { ThemedText } from '@/componentes/themed-text';
import { ThemedView } from '@/componentes/themed-view';
import { ejerciciosDeGrupo } from '@/datos/ejercicios';
import { nombreDeGrupo, type GrupoId } from '@/datos/grupos-musculares';
import { Spacing } from '@/estilos/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSesion } from '@/servicios/sesion';

export default function Inicio() {
  const tema = useTheme();
  const router = useRouter();
  const { usuario } = useSesion();
  const [vista, setVista] = useState<Vista>('frente');
  const [grupo, setGrupo] = useState<GrupoId | null>(null);

  if (!usuario) return null;

  function cambiarVista(nueva: Vista) {
    setVista(nueva);
    // Si el músculo elegido no se ve en la otra vista, se deselecciona.
    if (grupo && !gruposDeVista(nueva).includes(grupo)) setGrupo(null);
  }

  function verEjercicios() {
    if (grupo) router.push({ pathname: '/ejercicios/[grupo]', params: { grupo } });
  }

  const disponibles = gruposDeVista(vista);

  return (
    <Pantalla conTabs conLogo>
      <View>
        <ThemedText type="subtitle" style={styles.titulo}>
          Hola, {usuario.apodo}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Toca un músculo para ver sus ejercicios.
        </ThemedText>
      </View>

      <Segmentado<Vista>
        opciones={[
          { valor: 'frente', etiqueta: 'Frente' },
          { valor: 'espalda', etiqueta: 'Espalda' },
        ]}
        valor={vista}
        onCambio={cambiarVista}
      />

      <MapaMuscular sexo={usuario.sexo} vista={vista} seleccionado={grupo} onSeleccionar={setGrupo} />

      <ThemedView type="backgroundElement" style={[styles.tarjeta, { borderColor: tema.borde }]}>
        {grupo ? (
          <>
            <ThemedText type="subtitle" style={styles.grupo}>
              {nombreDeGrupo(grupo)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {ejerciciosDeGrupo(grupo).length} ejercicios: principiante, intermedio y avanzado.
            </ThemedText>
            <Boton titulo="Ver ejercicios" onPress={verEjercicios} />
          </>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Ningún músculo seleccionado.
          </ThemedText>
        )}
      </ThemedView>

      <View style={styles.chips} accessibilityLabel="Grupos musculares de esta vista">
        {disponibles.map((id) => {
          const activo = id === grupo;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              onPress={() => setGrupo(id)}
              style={[
                styles.chip,
                {
                  borderColor: activo ? tema.acento : tema.borde,
                  backgroundColor: activo ? tema.acento : 'transparent',
                },
              ]}>
              <ThemedText
                type="small"
                style={{ color: activo ? tema.textoSobreAcento : tema.text }}>
                {nombreDeGrupo(id)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 28, lineHeight: 36 },
  tarjeta: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  grupo: { fontSize: 22, lineHeight: 30 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
  },
});
