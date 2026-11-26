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
    if (!uid) return;
    // Perfil en caché: el rol se conoce aunque no haya señal.
    AsyncStorage.getItem(PROFILE_KEY).then((raw) => raw && setProfile(JSON.parse(raw)));
    supabase
      .from('profiles')
      .select('role,name')
      .eq('id', uid)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setProfile(data as { role: Role; name: string });
        AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
      });
  }, [uid]);

  const isCoordinator = profile.role === 'coordinador' || profile.role === 'admin';
  return <Ctx.Provider value={{ session, loading, ...profile, isCoordinator }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
