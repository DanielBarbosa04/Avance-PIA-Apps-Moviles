import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function AppLayout() {
  const tema = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: tema.background },
        headerTintColor: tema.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: tema.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ejercicios/[grupo]" options={{ title: 'Ejercicios' }} />
      <Stack.Screen name="ejercicio/[id]" options={{ title: 'Ejercicio' }} />
    </Stack>
  );
}
