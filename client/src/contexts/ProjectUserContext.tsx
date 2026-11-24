import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectUserLogin, projectUserSignup, projectUserLogout, projectUserToken, getMyProjects } from '@/lib/projectUserApi';
import type { ProjectUser } from '@/lib/supabase';

interface ProjectUserContextType {
  isLoggedIn: boolean;
  /** false until the stored token has been checked, so pages don't redirect to login on refresh */
  authChecked: boolean;
  user: ProjectUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string, website?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const ProjectUserContext = createContext<ProjectUserContextType | undefined>(undefined);

export const ProjectUserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<ProjectUser | null>(null);
  const [authChecked, setAuthChecked] = useState(() => !projectUserToken.get());

  useEffect(() => {
    const token = projectUserToken.get();
    if (!token) return;
    // Validate token by fetching /me
    getMyProjects()
      .then(({ user: u }) => {
        setUser(u);
        setIsLoggedIn(true);
      })
      .catch(() => {
        projectUserToken.clear();
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { token, user: u } = await projectUserLogin(username, password);
      projectUserToken.set(token);
      setUser(u);
      setIsLoggedIn(true);
      return true;
    } catch {
      return false;
    }
  };

  // Throws (with .field) on validation errors so the form can show them inline
  const signup = async (username: string, email: string, password: string, website?: string) => {
    const { token, user: u } = await projectUserSignup({ username, email, password, website });
    projectUserToken.set(token);
    setUser(u);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try { await projectUserLogout(); } catch { projectUserToken.clear(); }
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <ProjectUserContext.Provider value={{ isLoggedIn, authChecked, user, login, signup, logout }}>
      {children}
    </ProjectUserContext.Provider>
  );
};

export const useProjectUser = () => {
  const ctx = useContext(ProjectUserContext);
  if (!ctx) throw new Error('useProjectUser must be used within ProjectUserProvider');
  return ctx;
};
