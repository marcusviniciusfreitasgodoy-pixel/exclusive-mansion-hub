import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole, Construtora, Imobiliaria } from '@/types/database';
import { criarConfiguracoesFormularioPadrao } from '@/lib/form-helpers';
interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  construtora: Construtora | null;
  imobiliaria: Imobiliaria | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: AppRole, profileData: ConstrutorSignupData | ImobiliariaSignupData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [construtora, setConstrutora] = useState<Construtora | null>(null);
  const [imobiliaria, setImobiliaria] = useState<Imobiliaria | null>(null);
  const [loading, setLoading] = useState(true);

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
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string, 
    password: string, 
    userRole: AppRole, 
    profileData: ConstrutorSignupData | ImobiliariaSignupData
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) return { error: error as Error };
    if (!data.user) return { error: new Error('Falha ao criar usuário') };

    // Insert role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: data.user.id, role: userRole });

    if (roleError) {
      console.error('Error inserting role:', roleError);
      return { error: roleError as unknown as Error };
    }

    // Insert profile based on role
    if (userRole === 'construtora') {
      const constData = profileData as ConstrutorSignupData;
      const { error: profileError } = await supabase
        .from('construtoras')
        .insert({
          user_id: data.user.id,
          nome_empresa: constData.nome_empresa,
          cnpj: constData.cnpj
        });
      if (profileError) return { error: profileError as unknown as Error };
    } else if (userRole === 'imobiliaria') {
      const imobData = profileData as ImobiliariaSignupData;
      const { data: imobiliariaData, error: profileError } = await supabase
        .from('imobiliarias')
        .insert({
          user_id: data.user.id,
          nome_empresa: imobData.nome_empresa,
          creci: imobData.creci,
          telefone: imobData.telefone,
          email_contato: imobData.email_contato
        })
        .select('id')
        .single();
      if (profileError) return { error: profileError as unknown as Error };

      // Create default form configurations for the new imobiliária
      if (imobiliariaData?.id) {
        await criarConfiguracoesFormularioPadrao(imobiliariaData.id, data.user.id);
      }
    }

    return { error: null };
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
      signIn,
      signUp,
      signOut,
      refreshProfile
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
