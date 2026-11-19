import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInputInstance } from 'react-native';

import { Boton } from '@/componentes/boton';
import { CampoTexto } from '@/componentes/campo-texto';
import { Pantalla } from '@/componentes/pantalla';
import { Segmentado } from '@/componentes/segmentado';
import { ThemedText } from '@/componentes/themed-text';
import { Spacing } from '@/estilos/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SexoUsuario } from '@/servicios/api';
import { erroresPorCampo, mensajeDeError } from '@/servicios/mensajes-error';
import { useSesion } from '@/servicios/sesion';

type Errores = Partial<Record<'correo' | 'contrasena' | 'apodo' | 'sexo' | 'pesoKg', string>>;

export default function Registro() {
  const tema = useTheme();
  const { registrarse } = useSesion();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [apodo, setApodo] = useState('');
  const [sexo, setSexo] = useState<SexoUsuario | null>(null);
  const [peso, setPeso] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const campoContrasena = useRef<TextInputInstance>(null);
  const campoApodo = useRef<TextInputInstance>(null);
  const campoPeso = useRef<TextInputInstance>(null);

  function validar(): { errores: Errores; pesoKg: number } {
    const e: Errores = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) e.correo = 'Escribe un correo válido.';
    if (contrasena.length < 10) e.contrasena = 'Mínimo 10 caracteres.';
    if (apodo.trim().length < 2 || apodo.trim().length > 30) e.apodo = 'Entre 2 y 30 caracteres.';
    if (!sexo) e.sexo = 'Elige una opción (define el mapa muscular).';
    const pesoKg = Number(peso.replace(',', '.'));
    if (!peso.trim() || !Number.isFinite(pesoKg) || pesoKg < 20 || pesoKg > 400) {
      e.pesoKg = 'Escribe un peso entre 20 y 400 kg.';
    }
    return { errores: e, pesoKg };
  }

  async function enviar() {
    const { errores: e, pesoKg } = validar();
    setErrores(e);
    setErrorGeneral('');
    if (Object.keys(e).length > 0 || !sexo) return;

    setEnviando(true);
    try {
      await registrarse({
        correo: correo.trim().toLowerCase(),
        contrasena,
        apodo: apodo.trim(),
        sexo,
        pesoKg,
      });
      // Con la sesión iniciada, la protección de rutas lleva a la app.
    } catch (err) {
      const delServidor = erroresPorCampo(err);
      if (Object.keys(delServidor).length > 0) setErrores(delServidor as Errores);
      else setErrorGeneral(mensajeDeError(err));
      setEnviando(false);
    }
  }

  return (
    <Pantalla>
      <ThemedText type="subtitle" style={styles.titulo}>
        Crear cuenta
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Tu peso y tu sexo se usan para personalizar el mapa muscular y tu progreso.
      </ThemedText>

      <CampoTexto
        etiqueta="Correo"
        value={correo}
        onChangeText={setCorreo}
        error={errores.correo}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => campoContrasena.current?.focus()}
      />
      <CampoTexto
        etiqueta="Contraseña (mínimo 10 caracteres)"
        inputRef={campoContrasena}
        value={contrasena}
        onChangeText={setContrasena}
        error={errores.contrasena}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => campoApodo.current?.focus()}
      />
      <CampoTexto
        etiqueta="Apodo"
        inputRef={campoApodo}
        value={apodo}
        onChangeText={setApodo}
        error={errores.apodo}
        autoCapitalize="words"
        maxLength={30}
        returnKeyType="next"
        onSubmitEditing={() => campoPeso.current?.focus()}
      />

      <View style={styles.grupo}>
        <ThemedText type="smallBold">Sexo</ThemedText>
        <Segmentado<SexoUsuario>
          opciones={[
            { valor: 'MASCULINO', etiqueta: 'Masculino' },
            { valor: 'FEMENINO', etiqueta: 'Femenino' },
          ]}
          valor={sexo}
          onCambio={setSexo}
        />
        {errores.sexo ? (
          <ThemedText type="small" style={{ color: tema.peligro }}>
            {errores.sexo}
          </ThemedText>
        ) : null}
      </View>

      <CampoTexto
        etiqueta="Peso (kg)"
        inputRef={campoPeso}
        value={peso}
        onChangeText={setPeso}
        error={errores.pesoKg}
        keyboardType="decimal-pad"
        placeholder="Ej. 70.5"
        returnKeyType="done"
        onSubmitEditing={enviar}
      />

      {errorGeneral ? (
        <ThemedText type="small" style={{ color: tema.peligro }}>
          {errorGeneral}
        </ThemedText>
      ) : null}

      <Boton titulo="Crear cuenta" onPress={enviar} cargando={enviando} />

      <View style={styles.pie}>
        <ThemedText type="small" themeColor="textSecondary">
          ¿Ya tienes cuenta?
        </ThemedText>
        <Link href="/iniciar-sesion">
          <ThemedText type="smallBold" style={{ color: tema.acento }}>
            Iniciar sesión
          </ThemedText>
        </Link>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 28, lineHeight: 36 },
  grupo: { gap: Spacing.one },
  pie: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.two },
});
