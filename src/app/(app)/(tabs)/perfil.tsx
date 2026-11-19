import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Boton } from '@/componentes/boton';
import { CampoTexto } from '@/componentes/campo-texto';
import { Pantalla } from '@/componentes/pantalla';
import { ThemedText } from '@/componentes/themed-text';
import { ThemedView } from '@/componentes/themed-view';
import { Spacing } from '@/estilos/theme';
import { useTheme } from '@/hooks/use-theme';
import { erroresPorCampo, mensajeDeError } from '@/servicios/mensajes-error';
import { useSesion } from '@/servicios/sesion';

export default function Perfil() {
  const tema = useTheme();
  const { usuario, actualizarPerfil, cerrarSesion } = useSesion();
  const [apodo, setApodo] = useState(usuario?.apodo ?? '');
  const [peso, setPeso] = useState(String(usuario?.pesoKg ?? ''));
  const [errores, setErrores] = useState<{ apodo?: string; pesoKg?: string }>({});
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);
  const [guardando, setGuardando] = useState(false);

  if (!usuario) return null;

  const pesoNuevo = Number(peso.replace(',', '.'));
  const hayCambios = apodo.trim() !== usuario.apodo || (Number.isFinite(pesoNuevo) && pesoNuevo !== usuario.pesoKg);

  async function guardar() {
    if (!usuario) return;
    const e: typeof errores = {};
    if (apodo.trim().length < 2 || apodo.trim().length > 30) e.apodo = 'Entre 2 y 30 caracteres.';
    if (!peso.trim() || !Number.isFinite(pesoNuevo) || pesoNuevo < 20 || pesoNuevo > 400) {
      e.pesoKg = 'Escribe un peso entre 20 y 400 kg.';
    }
    setErrores(e);
    setMensaje(null);
    if (Object.keys(e).length > 0) return;

    const cambios: { apodo?: string; pesoKg?: number } = {};
    if (apodo.trim() !== usuario.apodo) cambios.apodo = apodo.trim();
    if (pesoNuevo !== usuario.pesoKg) cambios.pesoKg = pesoNuevo;

    setGuardando(true);
    try {
      await actualizarPerfil(cambios);
      setMensaje({ texto: 'Cambios guardados.', error: false });
    } catch (err) {
      const delServidor = erroresPorCampo(err);
      if (Object.keys(delServidor).length > 0) setErrores(delServidor);
      else setMensaje({ texto: mensajeDeError(err), error: true });
    } finally {
      setGuardando(false);
    }
  }

  function confirmarSalida() {
    Alert.alert('Cerrar sesión', '¿Quieres cerrar tu sesión en este teléfono?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void cerrarSesion() },
    ]);
  }

  return (
    <Pantalla conTabs conLogo>
      <ThemedText type="subtitle" style={styles.titulo}>
        Perfil
      </ThemedText>

      <ThemedView type="backgroundElement" style={[styles.tarjeta, { borderColor: tema.borde }]}>
        <Dato etiqueta="Correo" valor={usuario.correo} />
        <Dato etiqueta="Sexo" valor={usuario.sexo === 'MASCULINO' ? 'Masculino' : 'Femenino'} />
        <ThemedText type="small" themeColor="textSecondary">
          El correo y el sexo no se pueden cambiar desde la app.
        </ThemedText>
      </ThemedView>

      <CampoTexto
        etiqueta="Apodo"
        value={apodo}
        onChangeText={setApodo}
        error={errores.apodo}
        autoCapitalize="words"
        maxLength={30}
      />
      <CampoTexto
        etiqueta="Peso (kg)"
        value={peso}
        onChangeText={setPeso}
        error={errores.pesoKg}
        keyboardType="decimal-pad"
      />

      {mensaje ? (
        <ThemedText type="small" style={{ color: mensaje.error ? tema.peligro : tema.acento }}>
          {mensaje.texto}
        </ThemedText>
      ) : null}

      <Boton titulo="Guardar cambios" onPress={guardar} cargando={guardando} deshabilitado={!hayCambios} />

      <View style={styles.separador} />
      <Boton titulo="Cerrar sesión" onPress={confirmarSalida} variante="peligro" />
    </Pantalla>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.dato}>
      <ThemedText type="small" themeColor="textSecondary">
        {etiqueta}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.valor}>
        {valor}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 28, lineHeight: 36 },
  tarjeta: { borderRadius: Spacing.three, borderWidth: 1, padding: Spacing.three, gap: Spacing.two },
  dato: { gap: 2 },
  valor: { fontSize: 16, lineHeight: 22 },
  separador: { height: Spacing.two },
});
