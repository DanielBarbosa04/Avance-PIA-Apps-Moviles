import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInputInstance } from 'react-native';

import { Boton } from '@/componentes/boton';
import { CampoTexto } from '@/componentes/campo-texto';
import { Logo } from '@/componentes/logo';
import { Pantalla } from '@/componentes/pantalla';
import { ThemedText } from '@/componentes/themed-text';
import { Spacing } from '@/estilos/theme';
import { useTheme } from '@/hooks/use-theme';
import { mensajeDeError } from '@/servicios/mensajes-error';
import { useSesion } from '@/servicios/sesion';

export default function IniciarSesion() {
  const tema = useTheme();
  const { iniciarSesion } = useSesion();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const campoContrasena = useRef<TextInputInstance>(null);

  async function enviar() {
    if (!correo.trim() || !contrasena) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setError('');
    setEnviando(true);
    try {
      await iniciarSesion(correo.trim().toLowerCase(), contrasena);
      // No hace falta navegar: al haber sesión, la protección de rutas redirige.
    } catch (e) {
      setError(mensajeDeError(e));
      setEnviando(false);
    }
  }

  return (
    <Pantalla>
      <View style={styles.marca}>
        <Logo ancho={220} />
        <ThemedText type="code" style={styles.eslogan}>
          Your body. Your data
        </ThemedText>
      </View>

      <ThemedText type="subtitle" style={styles.titulo}>
        Iniciar sesión
      </ThemedText>

      <CampoTexto
        etiqueta="Correo"
        value={correo}
        onChangeText={setCorreo}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => campoContrasena.current?.focus()}
      />
      <CampoTexto
        etiqueta="Contraseña"
        inputRef={campoContrasena}
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={enviar}
      />

      {error ? (
        <ThemedText type="small" style={{ color: tema.peligro }}>
          {error}
        </ThemedText>
      ) : null}

      <Boton titulo="Entrar" onPress={enviar} cargando={enviando} />

      <View style={styles.pie}>
        <ThemedText type="small" themeColor="textSecondary">
          ¿Aún no tienes cuenta?
        </ThemedText>
        <Link href="/registro">
          <ThemedText type="smallBold" style={{ color: tema.acento }}>
            Crear cuenta
          </ThemedText>
        </Link>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  marca: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.three },
  eslogan: { textTransform: 'uppercase' },
  titulo: { fontSize: 28, lineHeight: 36 },
  pie: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.two },
});
