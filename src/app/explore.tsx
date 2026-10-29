import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Recordatorios } from '@/componentes/recordatorios';
import { ThemedText } from '@/componentes/themed-text';
import { ThemedView } from '@/componentes/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/estilos/theme';

export default function RecordatoriosScreen() {
  return (
    <ThemedView style={styles.contenedor}>
      <SafeAreaView style={styles.areaSegura}>
        <ScrollView contentContainerStyle={styles.contenido}>
          <ThemedText type="title" style={styles.titulo}>
            Recordatorios
          </ThemedText>
          <ThemedText type="small">
            Elige cuándo quieres que DynaMD te anime a entrenar. Todo se guarda solo en tu teléfono.
          </ThemedText>
          <Recordatorios />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  areaSegura: { flex: 1, maxWidth: MaxContentWidth, paddingHorizontal: Spacing.four },
  contenido: {
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  titulo: { fontSize: 32, lineHeight: 40 },
});