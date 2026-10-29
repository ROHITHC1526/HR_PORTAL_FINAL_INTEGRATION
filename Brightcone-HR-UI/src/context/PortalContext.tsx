import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type PortalApp = 'people' | 'recruit' | 'payroll' | 'expense' | 'learn' | 'sign' | 'connect' | 'shift' | 'plus';
export type UserRoleType = 'admin' | 'employee';

interface PortalContextType {
  currentApp: PortalApp;
  setCurrentApp: (app: PortalApp) => void;
  activeRole: UserRoleType;
  setActiveRole: (role: UserRoleType) => void;
  switchRole: (role: UserRoleType) => void;
  isAppLauncherOpen: boolean;
  setIsAppLauncherOpen: (open: boolean) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Default app from pathname, localStorage or 'people'
  const [currentApp, setCurrentApp] = useState<PortalApp>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/shift')) return 'shift';
      if (path.startsWith('/expenses') || path.startsWith('/office-expenses') || path.startsWith('/my-expenses') || path.startsWith('/expense')) return 'expense';
      if (path.startsWith('/doc-sign') || path.startsWith('/sign')) return 'sign';
      if (path.startsWith('/connect') || path.startsWith('/engagement') || path.startsWith('/feed') || path.startsWith('/helpdesk')) return 'connect';
      if (path.startsWith('/recruit')) return 'recruit';
      if (path.startsWith('/learn')) return 'learn';
      if (path.startsWith('/payroll') || path.startsWith('/pay')) return 'payroll';
      if (path.startsWith('/suite') || path.startsWith('/plus') || path.startsWith('/people-plus')) return 'plus';
      if (path.startsWith('/people')) return 'people';
    }
    return (localStorage.getItem('brightcone_app') as PortalApp) || 'people';
  });

  // Role detection: if user role contains 'Admin' or 'HR' -> admin, otherwise employee
  const [activeRole, setActiveRole] = useState<UserRoleType>(() => {
    const saved = localStorage.getItem('brightcone_role_mode') as UserRoleType;
    if (saved) return saved;
    if (user?.role && (user.role.toLowerCase().includes('admin') || user.role.toLowerCase().includes('hr'))) {
      return 'admin';
    }
    return 'employee';
  });

  const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('brightcone_app', currentApp);
  }, [currentApp]);

  useEffect(() => {
    localStorage.setItem('brightcone_role_mode', activeRole);
  }, [activeRole]);

  useEffect(() => {
    if (user) {
      const email = user.email?.toLowerCase() || '';
      const roleStr = user.role?.toLowerCase() || '';
      if (email === 'admin@brightcone.ai' || roleStr.includes('admin') || roleStr.includes('hr')) {
        setActiveRole('admin');
        localStorage.setItem('brightcone_role_mode', 'admin');
      } else {
        setActiveRole('employee');
        localStorage.setItem('brightcone_role_mode', 'employee');
      }
    }
  }, [user]);

  const switchRole = (role: UserRoleType) => {
    setActiveRole(role);
    localStorage.setItem('brightcone_role_mode', role);
  };

  return (
    <PortalContext.Provider
      value={{
        currentApp,
        setCurrentApp,
        activeRole,
        setActiveRole,
        switchRole,
        isAppLauncherOpen,
        setIsAppLauncherOpen,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = (): PortalContextType => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
