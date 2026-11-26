import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner, Button, Field, s } from '../components/ui';
import { useAuth } from '../lib/auth';
import { configured, supabase } from '../lib/supabase';
import { c, type } from '../lib/theme';

export default function Login() {
  const { session } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (session) return <Redirect href="/" />;

  async function submit() {
    setBusy(true);
    setMsg(null);
    const creds = { email: email.trim(), password };
    const { error, data } =
      mode === 'in'
        ? await supabase.auth.signInWithPassword(creds)
        : await supabase.auth.signUp({ ...creds, options: { data: { name: name.trim() } } });
    setBusy(false);
    if (error) setMsg(error.message.includes('Invalid login') ? 'Correo o contraseña incorrectos.' : error.message);
    else if (mode === 'up' && !data.session) setMsg('Revisa tu correo para confirmar la cuenta y luego entra.');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 28, flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', gap: 14 }}>
            <Image source={require('../../assets/logo.png')} style={{ width: 132, height: 132 }} accessibilityLabel="Fundación Reto Same" />
            <Text style={[type.headline, { fontSize: 24, textAlign: 'center' }]}>Registro de nidos</Text>
            <Text style={[type.bodyDim, { textAlign: 'center' }]}>Conectados con el mar · Same, Tonchigüe y Atacames</Text>
          </View>

          {!configured && (
            <Banner icon="database-off-outline" tone="warn">
              <Text style={type.bodyDim}>Falta configurar Supabase (EXPO_PUBLIC_SUPABASE_URL y _KEY en apps/campo/.env).</Text>
            </Banner>
          )}

          <View style={{ gap: 16 }}>
            {mode === 'up' && (
              <Field label="Tu nombre">
                <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Ej. Tabata" placeholderTextColor={c.textDim} autoComplete="name" />
              </Field>
            )}
            <Field label="Correo">
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="tu@correo.com" placeholderTextColor={c.textDim}
                keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            </Field>
            <Field label="Contraseña">
              <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 6 caracteres"
                placeholderTextColor={c.textDim} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} onSubmitEditing={submit} />
            </Field>
            {msg && <Text style={[type.bodyDim, { color: c.amber }]} accessibilityLiveRegion="polite">{msg}</Text>}
            <Button big label={mode === 'in' ? 'Entrar' : 'Crear cuenta'} onPress={submit} loading={busy}
              disabled={!configured || !email || password.length < 6 || (mode === 'up' && !name.trim())} />
            <Button variant="text" label={mode === 'in' ? '¿Eres nuevo? Crea tu cuenta de voluntario' : 'Ya tengo cuenta'}
              onPress={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(null); }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
