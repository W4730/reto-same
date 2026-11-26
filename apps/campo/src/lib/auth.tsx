import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

type Role = 'voluntario' | 'coordinador' | 'admin';
type Auth = { session: Session | null; loading: boolean; role: Role; name: string; isCoordinator: boolean };

const Ctx = createContext<Auth>({ session: null, loading: true, role: 'voluntario', name: '', isCoordinator: false });
const PROFILE_KEY = 'retosame.profile';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ role: Role; name: string }>({ role: 'voluntario', name: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const uid = session?.user.id;
  useEffect(() => {
    setProfile({ role: 'voluntario', name: '' }); // nunca heredar el rol de la cuenta anterior
    if (!uid) return;
    const key = `${PROFILE_KEY}.${uid}`;
    let fresh = false;
    // Perfil en caché por usuario: el rol se conoce sin señal, pero nunca pisa al que llega del servidor.
    AsyncStorage.getItem(key).then((raw) => raw && !fresh && setProfile(JSON.parse(raw)));
    supabase
      .from('profiles')
      .select('role,name')
      .eq('id', uid)
      .single()
      .then(({ data }) => {
        if (!data) return;
        fresh = true;
        setProfile(data as { role: Role; name: string });
        AsyncStorage.setItem(key, JSON.stringify(data));
      });
  }, [uid]);

  const isCoordinator = profile.role === 'coordinador' || profile.role === 'admin';
  return <Ctx.Provider value={{ session, loading, ...profile, isCoordinator }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
