import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner, Button, Chip, Field, s } from '../components/ui';
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
  const [role, setRole] = useState<'voluntario' | 'coordinador'>('voluntario');
  const [code, setCode] = useState('');

  if (session) return <Redirect href="/" />;

  async function submit() {
    setBusy(true);
    setMsg(null);
    const creds = { email: email.trim(), password };
    const { error, data } =
      mode === 'in'
        ? await supabase.auth.signInWithPassword(creds)
        : await supabase.auth.signUp({
            ...creds,
            // El código lo valida la base de datos (trigger), nunca la app.
            options: { data: { name: name.trim(), ...(role === 'coordinador' ? { admin_code: code.trim().toUpperCase() } : {}) } },
          });
    setBusy(false);
    if (error) setMsg(authError(error.message, role === 'coordinador'));
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
            {mode === 'up' && (
              <Field label="Me registro como">
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Chip label="Voluntario" selected={role === 'voluntario'} onPress={() => setRole('voluntario')} />
                  <Chip label="Coordinador" selected={role === 'coordinador'} onPress={() => setRole('coordinador')} />
                </View>
              </Field>
            )}
            {mode === 'up' && role === 'coordinador' && (
              <Field label="Código de coordinador">
                <TextInput style={s.input} value={code} onChangeText={setCode} secureTextEntry autoCapitalize="characters" autoCorrect={false}
                  placeholder="Te lo da un coordinador de Reto Same" placeholderTextColor={c.textDim} />
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
              disabled={!configured || !email || password.length < 6 || (mode === 'up' && (!name.trim() || (role === 'coordinador' && !code.trim())))} />
            <Button variant="text" label={mode === 'in' ? '¿Eres nuevo? Crea tu cuenta' : 'Ya tengo cuenta'}
              onPress={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(null); }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Mensajes de Supabase Auth en español. */
function authError(m: string, asCoordinator: boolean) {
  if (m.includes('Invalid login')) return 'Correo o contraseña incorrectos.';
  if (m.includes('Email not confirmed')) return 'Confirma tu correo antes de entrar.';
  if (m.includes('already registered')) return 'Ese correo ya tiene cuenta. Toca “Ya tengo cuenta”.';
  if (/is invalid/i.test(m)) return 'Ese correo no es válido.';
  if (/rate limit|security purposes/i.test(m)) return 'Demasiados intentos. Espera unos minutos.';
  // El trigger rechaza el registro completo cuando el código no coincide.
  if (asCoordinator && /database error/i.test(m)) return 'El código de coordinador no es correcto.';
  return m;
}
