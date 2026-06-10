import { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { AnimatePresence, motion } from 'framer-motion';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { API_URL } from './config/api';
import { getCurrentPosition } from './lib/geo';
import { clearStoredSession, loadStoredSession, saveStoredSession } from './lib/sessionStorage';
import { cn } from './lib/utils';
import { DashboardView } from './pages/DashboardPage';
import { HistoryView } from './pages/HistoryPage';
import { LoginView } from './pages/LoginPage';
import { LocationsView } from './pages/LocationsPage';
import { ManagerDashboardView } from './pages/ManagerDashboardPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { RegistrationView } from './pages/RegistrationPage';
import { SettingsView } from './pages/SettingsPage';
import { TeamView } from './pages/TeamPage';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';
import { getHomePath, getUserType, getViewFromPath, getViewPath } from './routes/routeUtils';
import type { Session, View } from './types/auth';

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(() => loadStoredSession());
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = getViewFromPath(location.pathname);
  const userType = getUserType(session?.user.rol);
  const homePath = getHomePath(session?.user.rol);

  useEffect(() => {
    let isMounted = true;

    const registerBackButton = async () => {
      const listener = await CapacitorApp.addListener('backButton', () => {
        const isHomeRoute = location.pathname === homePath || location.pathname === '/login';

        if (!isHomeRoute) {
          navigate(-1);
          return;
        }

        CapacitorApp.exitApp();
      });

      if (!isMounted) {
        listener.remove();
      }

      return listener;
    };

    const listenerPromise = registerBackButton();

    return () => {
      isMounted = false;
      listenerPromise.then((listener) => listener?.remove());
    };
  }, [homePath, location.pathname, navigate]);

  const handleLogin = (nextSession: Session) => {
    saveStoredSession(nextSession);
    setSession(nextSession);
    navigate(getHomePath(nextSession.user.rol), { replace: true });
  };

  const handleLogout = () => {
    clearStoredSession();
    setSession(null);
    navigate('/login', { replace: true });
  };

  const handleViewChange = (nextView: View) => {
    if (nextView === 'login') {
      handleLogout();
      return;
    }

    navigate(getViewPath(nextView, userType));
  };

  const handleClockIn = async (locationId: number) => {
    if (!session) {
      navigate('/login', { replace: true });
      throw new Error('Inicia sesion de nuevo');
    }

    const position = await getCurrentPosition();
    const response = await fetch(`${API_URL}/api/attendance/clock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        locacion_id: locationId,
        latitud: position.coords.latitude,
        longitud: position.coords.longitude,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo registrar la entrada');
    }

    navigate('/dashboard');
  };

  const handleClockOut = async () => {
    if (!session) {
      handleLogout();
      return;
    }

    const position = await getCurrentPosition();
    const response = await fetch(`${API_URL}/api/attendance/clock-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        latitud: position.coords.latitude,
        longitud: position.coords.longitude,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || 'No se pudo registrar la salida');
      return;
    }

    alert('Salida registrada');
  };

  return (
    <div className="min-h-screen bg-surface">
      {session && currentView !== 'login' && (
        <TopBar
          title="Workforce Pro"
          userType={userType}
          onViewChange={handleViewChange}
        />
      )}

      <main className={cn('mx-auto max-w-7xl px-6', currentView !== 'login' && 'pt-8')}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to={session ? getHomePath(session.user.rol) : '/login'} replace />} />
              <Route path="/login" element={<PublicRoute session={session}><LoginView onLogin={handleLogin} /></PublicRoute>} />
              <Route
                path="/dashboard"
                element={(
                  <ProtectedRoute session={session} allowedRoles={['empleado']}>
                    {session && <DashboardView session={session} onAction={handleViewChange} onClockOut={handleClockOut} />}
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/manager"
                element={(
                  <ProtectedRoute session={session} allowedRoles={['admin', 'supervisor']}>
                    {session && <ManagerDashboardView session={session} onAction={handleViewChange} />}
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/registration"
                element={(
                  <ProtectedRoute session={session} allowedRoles={['empleado']}>
                    {session && <RegistrationView session={session} onComplete={handleClockIn} />}
                  </ProtectedRoute>
                )}
              />
              <Route path="/history" element={<ProtectedRoute session={session}><HistoryView /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute session={session}><SettingsView /></ProtectedRoute>} />
              <Route
                path="/locations"
                element={(
                  <ProtectedRoute session={session} allowedRoles={['admin', 'supervisor']}>
                    {session && <LocationsView session={session} onBack={() => navigate('/manager')} />}
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/team"
                element={(
                  <ProtectedRoute session={session} allowedRoles={['admin', 'supervisor']}>
                    {session && <TeamView session={session} onBack={() => navigate('/manager')} />}
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/schedule"
                element={(
                  <ProtectedRoute session={session}>
                    <PlaceholderPage view="schedule" onBack={() => navigate(getHomePath(session?.user.rol))} />
                  </ProtectedRoute>
                )}
              />
              <Route path="*" element={<Navigate to={session ? getHomePath(session.user.rol) : '/login'} replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {session && currentView !== 'login' && currentView !== 'registration' && (
        <BottomNav currentView={currentView} onViewChange={handleViewChange} />
      )}
    </div>
  );
}
