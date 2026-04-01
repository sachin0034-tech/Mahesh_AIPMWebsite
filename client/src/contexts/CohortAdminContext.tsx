import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminLogin, adminLogout, cohortAdminToken } from '@/lib/cohortApi';

interface CohortAdminContextType {
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const CohortAdminContext = createContext<CohortAdminContextType | undefined>(undefined);

export const CohortAdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // If a token exists in storage, treat as authenticated
    setIsAdmin(!!cohortAdminToken.get());
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { token } = await adminLogin(email, password);
      cohortAdminToken.set(token);
      setIsAdmin(true);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try { await adminLogout(); } catch { cohortAdminToken.clear(); }
    setIsAdmin(false);
  };

  return (
    <CohortAdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </CohortAdminContext.Provider>
  );
};

export const useCohortAdmin = () => {
  const ctx = useContext(CohortAdminContext);
  if (!ctx) throw new Error('useCohortAdmin must be used within CohortAdminProvider');
  return ctx;
};
