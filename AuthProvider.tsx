import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { DEMO_PROFILE, DEMO_USER_ID } from '@/data/sample-users';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { KEYS, loadJson, removeKey, saveJson } from '@/lib/storage';
import { Profile } from '@/types';

type AuthMode = 'local' | 'supabase';

interface AuthContextValue {
  ready: boolean;
  mode: AuthMode;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  signInLocal: (email: string, displayName?: string) => Promise<void>;
  signUpLocal: (email: string, displayName: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const mode: AuthMode = isSupabaseConfigured ? 'supabase' : 'local';

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (mode === 'supabase') {
        const supabase = getSupabase();
        if (!supabase) {
          setReady(true);
          return;
        }
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);
        if (data.session?.user) {
          await hydrateSupabaseProfile(data.session.user.id);
        }
        supabase.auth.onAuthStateChange(async (_event, next) => {
          setSession(next);
          if (next?.user) {
            await hydrateSupabaseProfile(next.user.id);
          } else {
            setProfile(null);
          }
        });
      } else {
        const stored = await loadJson<{ email: string } | null>(KEYS.session, null);
        const storedProfile = await loadJson<Profile | null>(KEYS.profile, null);
        if (stored && storedProfile) {
          setProfile(storedProfile);
        }
      }
      if (mounted) setReady(true);
    }

    async function hydrateSupabaseProfile(userId: string) {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (data) setProfile(data as Profile);
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [mode]);

  const signInLocal = useCallback(async (email: string, displayName?: string) => {
    const existing = await loadJson<Profile | null>(KEYS.profile, null);
    const next: Profile = existing
      ? existing
      : {
          ...DEMO_PROFILE,
          id: DEMO_USER_ID,
          display_name: displayName || email.split('@')[0] || 'Weby Member',
          username: (displayName || email.split('@')[0] || 'member')
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .slice(0, 20),
          onboarding_complete: false,
        };
    await saveJson(KEYS.session, { email });
    await saveJson(KEYS.profile, next);
    setProfile(next);
  }, []);

  const signUpLocal = useCallback(async (email: string, displayName: string) => {
    const next: Profile = {
      ...DEMO_PROFILE,
      id: DEMO_USER_ID,
      display_name: displayName,
      username: displayName.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20),
      onboarding_complete: false,
      points: 0,
      level: 1,
    };
    await saveJson(KEYS.session, { email });
    await saveJson(KEYS.profile, next);
    setProfile(next);
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (mode === 'local') {
      await signInLocal(email);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, [mode, signInLocal]);

  const signUpWithPassword = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (mode === 'local') {
        await signUpLocal(email, displayName);
        return;
      }
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase is not configured');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          display_name: displayName,
          username: displayName.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20),
          onboarding_complete: false,
        });
      }
    },
    [mode, signUpLocal]
  );

  const signOut = useCallback(async () => {
    if (mode === 'supabase') {
      await getSupabase()?.auth.signOut();
    }
    await removeKey(KEYS.session);
    setSession(null);
    setProfile(null);
  }, [mode]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!profile) return;
      const next = {
        ...profile,
        ...patch,
        updated_at: new Date().toISOString(),
      };
      if (mode === 'supabase') {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase is not configured');
        const { error } = await supabase.from('profiles').update(patch).eq('id', profile.id);
        if (error) throw error;
      } else {
        await saveJson(KEYS.profile, next);
      }
      setProfile(next);
    },
    [mode, profile]
  );

  const completeOnboarding = useCallback(async () => {
    await updateProfile({ onboarding_complete: true });
    await saveJson(KEYS.onboarding, true);
  }, [updateProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      mode,
      session,
      user: session?.user ?? null,
      profile,
      isAuthenticated: mode === 'supabase' ? !!session : !!profile,
      signInLocal,
      signUpLocal,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      updateProfile,
      completeOnboarding,
    }),
    [
      ready,
      mode,
      session,
      profile,
      signInLocal,
      signUpLocal,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      updateProfile,
      completeOnboarding,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
