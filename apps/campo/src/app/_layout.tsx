import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../lib/auth';
import { SyncProvider } from '../lib/sync';
import { c, font } from '../lib/theme';

SplashScreen.preventAutoHideAsync();

export default function Root() {
  const [loaded] = useFonts({ Montserrat_700Bold, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);
  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SyncProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: c.bg },
              headerTintColor: c.text,
              headerTitleStyle: { fontFamily: font.display, fontSize: 17 },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: c.bg },
              animation: 'fade_from_bottom',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="registrar" options={{ title: 'NUEVO NIDO', presentation: 'fullScreenModal' }} />
            <Stack.Screen name="nido/[id]" options={{ title: '' }} />
            <Stack.Screen name="equipo" options={{ title: 'EQUIPO' }} />
            <Stack.Screen name="reportes" options={{ title: 'REPORTES' }} />
          </Stack>
        </SyncProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
