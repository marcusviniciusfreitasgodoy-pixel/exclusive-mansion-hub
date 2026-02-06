import { createContext, useContext, useState, ReactNode } from 'react';
import type { AppRole, Construtora, Imobiliaria } from '@/types/database';
import { DEMO_CONSTRUTORA, DEMO_IMOBILIARIA } from '@/data/demo-data';

interface DemoContextType {
  isDemo: boolean;
  demoRole: AppRole | null;
  setDemoRole: (role: AppRole | null) => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemo: false,
  demoRole: null,
  setDemoRole: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoRole, setDemoRole] = useState<AppRole | null>(null);

  return (
    <DemoContext.Provider value={{ isDemo: true, demoRole, setDemoRole }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}

// Hook that mimics useAuth() but returns demo data
export function useDemoAuth() {
  const { demoRole } = useDemo();

  return {
    user: { id: 'demo-user-id', email: 'demo@exemplo.com' } as any,
    session: { access_token: 'demo-token' } as any,
    role: demoRole,
    construtora: demoRole === 'construtora' ? DEMO_CONSTRUTORA as unknown as Construtora : null,
    imobiliaria: demoRole === 'imobiliaria' ? DEMO_IMOBILIARIA as unknown as Imobiliaria : null,
    loading: false,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => {},
    refreshProfile: async () => {},
  };
}
