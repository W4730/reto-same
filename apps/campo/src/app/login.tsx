import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner, Button, Chip, Field, PasswordInput, s } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useKeyboardCenter } from '../lib/keyboard';
import { configured, supabase } from '../lib/supabase';
import { c, type } from '../lib/theme';

export default function Login() {
  const { session } = useAuth();
  const kb = useKeyboardCenter();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [role, setRole] = useState<'voluntario' | 'coordinador'>('voluntario');
  const [code, setCode] = useState('');

  if (session) return <Redirect href="/" />;

  const signingUp = mode === 'up';
  const mismatch = signingUp && password2.length > 0 && password2 !== password;
  const canSubmit =
    configured && !!email && password.length >= 6 &&
    (!signingUp || (!!name.trim() && password2 === password && (role === 'voluntario' || !!code.trim())));

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setMsg(null);
    const creds = { email: email.trim(), password };
    const { error, data } = !signingUp
      ? await supabase.auth.signInWithPassword(creds)
      : await supabase.auth.signUp({
          ...creds,
          // El código lo valida la base de datos (trigger), nunca la app.
          options: { data: { name: name.trim(), ...(role === 'coordinador' ? { admin_code: code.trim().toUpperCase() } : {}) } },
        });
    setBusy(false);
    if (error) setMsg(authError(error.message, role === 'coordinador'));
    else if (signingUp && !data.session) setMsg('Revisa tu correo para confirmar la cuenta y luego entra.');
  }

  function switchMode() {
    setMode(signingUp ? 'in' : 'up');
    setPassword2('');
    setMsg(null);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView {...kb.scroll}>
        {/* Centrado vertical en la pantalla; el espaciador final (alto del teclado) permite subir el campo enfocado. */}
        <View style={{ minHeight: kb.viewH, justifyContent: 'center', padding: 24, gap: 28 }}>
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
          {signingUp && (
            <Field label="Tu nombre">
              <TextInput {...kb.field()} style={s.input} value={name} onChangeText={setName} placeholder="Ej. Tabata" placeholderTextColor={c.textDim} autoComplete="name" />
            </Field>
          )}
          {signingUp && (
            <Field label="Me registro como">
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chip label="Voluntario" selected={role === 'voluntario'} onPress={() => setRole('voluntario')} />
                <Chip label="Coordinador" selected={role === 'coordinador'} onPress={() => setRole('coordinador')} />
              </View>
            </Field>
          )}
          {signingUp && role === 'coordinador' && (
            <Field label="Código de coordinador">
              <PasswordInput {...kb.field()} value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="Te lo da un coordinador de Reto Same" />
            </Field>
          )}
          <Field label="Correo">
            <TextInput {...kb.field()} style={s.input} value={email} onChangeText={setEmail} placeholder="tu@correo.com" placeholderTextColor={c.textDim}
              keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          </Field>
          <Field label="Contraseña">
            <PasswordInput {...kb.field()} value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres"
              autoComplete={signingUp ? 'new-password' : 'current-password'} onSubmitEditing={signingUp ? undefined : submit} />
          </Field>
          {signingUp && (
            <Field label="Confirma la contraseña">
              <PasswordInput {...kb.field()} value={password2} onChangeText={setPassword2} placeholder="Escríbela otra vez"
                autoComplete="new-password" onSubmitEditing={submit} style={mismatch ? { borderColor: c.amber } : undefined} />
              {mismatch && <Text style={[type.bodyDim, { color: c.amber }]}>Las contraseñas no coinciden.</Text>}
            </Field>
          )}
          {msg && <Text style={[type.bodyDim, { color: c.amber }]} accessibilityLiveRegion="polite">{msg}</Text>}
          <Button big label={signingUp ? 'Crear cuenta' : 'Entrar'} onPress={submit} loading={busy} disabled={!canSubmit} />
          <Button variant="text" label={signingUp ? 'Ya tengo cuenta' : '¿Eres nuevo? Crea tu cuenta'} onPress={switchMode} />
        </View>
        </View>
        <View style={{ height: kb.pad }} />
      </ScrollView>
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
