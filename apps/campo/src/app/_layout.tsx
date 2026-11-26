import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../lib/auth';
import { SyncProvider } from '../lib/sync';
import { Button } from '../components/ui';
import { c, font, type } from '../lib/theme';

SplashScreen.preventAutoHideAsync();

export default function Root() {
  const [loaded] = useFonts({ Montserrat_700Bold, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);
  if (!loaded) return null;
  // La app de campo usa cámara, GPS y archivos locales: solo existe en el teléfono.
  if (Platform.OS === 'web') return <WebNotice />;

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
            <Stack.Screen name="mapa" options={{ title: 'MAPA DE NIDOS' }} />
            <Stack.Screen name="practicas" options={{ title: 'BUENAS PRÁCTICAS' }} />
          </Stack>
        </SyncProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function WebNotice() {
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
      <Text style={[type.headline, { textAlign: 'center' }]}>App de campo</Text>
      <Text style={[type.body, { textAlign: 'center', maxWidth: 420 }]}>
        El registro de nidos usa la cámara, el GPS y guarda fotos sin señal, así que funciona en el teléfono con Expo Go
        (o la app instalada), no en el navegador.
      </Text>
      <Text style={[type.bodyDim, { textAlign: 'center', maxWidth: 420 }]}>
        La web pública para turistas está en apps/web (npm run web).
      </Text>
      <Button label="Abrir la web pública local" icon="open-in-new" onPress={() => Linking.openURL('http://localhost:5173')} />
    </View>
  );
}
