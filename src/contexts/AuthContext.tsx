import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole, Construtora, Imobiliaria } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  construtora: Construtora | null;
  imobiliaria: Imobiliaria | null;
  loading: boolean;
  mfaRequired: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: AppRole, profileData: ConstrutorSignupData | ImobiliariaSignupData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeMFA: () => void;
}

export interface ConstrutorSignupData {
  nome_empresa: string;
  cnpj: string;
}

export interface ImobiliariaSignupData {
  nome_empresa: string;
  creci: string;
  telefone?: string;
  email_contato?: string;
  tipo?: 'imobiliaria' | 'corretor_autonomo';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [construtora, setConstrutora] = useState<Construtora | null>(null);
  const [imobiliaria, setImobiliaria] = useState<Imobiliaria | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

  const checkMFARequired = async () => {
    try {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (data && data.currentLevel === 'aal1' && data.nextLevel === 'aal2') {
        setMfaRequired(true);
      } else {
        setMfaRequired(false);
      }
    } catch {
      setMfaRequired(false);
    }
  };

  const completeMFA = () => {
    setMfaRequired(false);
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleData) {
        setRole(roleData.role as AppRole);

        // Fetch profile based on role
        if (roleData.role === 'construtora') {
          const { data: construtoraData } = await supabase
            .from('construtoras')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          setConstrutora(construtoraData as Construtora | null);
          setImobiliaria(null);
        } else if (roleData.role === 'imobiliaria') {
          const { data: imobiliariaData } = await supabase
            .from('imobiliarias')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          setImobiliaria(imobiliariaData as Imobiliaria | null);
          setConstrutora(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer Supabase calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setConstrutora(null);
          setImobiliaria(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      await checkMFARequired();
    }
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string, 
    password: string, 
    userRole: AppRole, 
    profileData: ConstrutorSignupData | ImobiliariaSignupData
  ) => {
    try {
      // Use edge function with service role to bypass RLS during signup
      const response = await supabase.functions.invoke('signup-user', {
        body: {
          email,
          password,
          role: userRole,
          profile: userRole === 'construtora' 
            ? {
                nome_empresa: (profileData as ConstrutorSignupData).nome_empresa,
                cnpj: (profileData as ConstrutorSignupData).cnpj,
              }
            : {
                nome_empresa: (profileData as ImobiliariaSignupData).nome_empresa,
                creci: (profileData as ImobiliariaSignupData).creci,
                telefone: (profileData as ImobiliariaSignupData).telefone,
                email_contato: (profileData as ImobiliariaSignupData).email_contato,
                tipo: (profileData as ImobiliariaSignupData).tipo || 'imobiliaria',
              }
        }
      });

      // Handle network/invoke errors
      if (response.error) {
        console.error('Signup function invoke error:', response.error);
        return { error: new Error('Erro de conexão. Tente novamente.') };
      }

      // Check the response payload for controlled errors
      const data = response.data as { success: boolean; code?: string; message?: string };
      
      if (!data.success) {
        return { 
          error: new Error(data.message || 'Erro ao criar conta'),
          code: data.code 
        };
      }

      return { error: null };
    } catch (err) {
      console.error('Signup error:', err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setConstrutora(null);
    setImobiliaria(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role,
      construtora,
      imobiliaria,
      loading,
      mfaRequired,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      completeMFA,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
