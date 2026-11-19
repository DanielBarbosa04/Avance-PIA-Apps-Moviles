import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/componentes/animated-icon';
import { SesionProvider, useSesion } from '@/servicios/sesion';

SplashScreen.preventAutoHideAsync();

// Protección de rutas: con sesión solo existe el grupo (app); sin sesión,
// solo el grupo (auth). Al iniciar o cerrar sesión, Expo Router redirige solo.
function NavegacionRaiz() {
  const { cargando, usuario } = useSesion();
  const haySesion = usuario !== null;

  if (cargando) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={haySesion} redirectTo="/iniciar-sesion">
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!haySesion} redirectTo="/">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SesionProvider>
        <AnimatedSplashOverlay />
        <NavegacionRaiz />
      </SesionProvider>
    </ThemeProvider>
  );
}
