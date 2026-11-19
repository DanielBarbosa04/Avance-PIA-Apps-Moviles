import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function AuthLayout() {
  const tema = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tema.background } }} />
  );
}
