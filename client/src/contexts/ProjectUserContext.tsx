import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectUserLogin, projectUserLogout, projectUserToken, getMyProjects } from '@/lib/projectUserApi';
import type { ProjectUser } from '@/lib/supabase';

interface ProjectUserContextType {
  isLoggedIn: boolean;
  user: ProjectUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const ProjectUserContext = createContext<ProjectUserContextType | undefined>(undefined);

export const ProjectUserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<ProjectUser | null>(null);

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
      });
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

  const logout = async () => {
    try { await projectUserLogout(); } catch { projectUserToken.clear(); }
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <ProjectUserContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </ProjectUserContext.Provider>
  );
};

export const useProjectUser = () => {
  const ctx = useContext(ProjectUserContext);
  if (!ctx) throw new Error('useProjectUser must be used within ProjectUserProvider');
  return ctx;
};
