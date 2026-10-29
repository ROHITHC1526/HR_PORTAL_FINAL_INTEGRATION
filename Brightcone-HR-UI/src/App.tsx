import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PortalProvider } from './context/PortalContext';
import { NotificationsProvider } from './services/NotificationsContext';
import { PeoplePlusProvider } from './people-plus/people-plus-context';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <PortalProvider>
            <NotificationsProvider>
              <PeoplePlusProvider>
                <AppRoutes />
              </PeoplePlusProvider>
            </NotificationsProvider>
          </PortalProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
