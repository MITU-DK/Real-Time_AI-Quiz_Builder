import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HostGamePage from './pages/HostGamePage';
import PlayerJoinPage from './pages/PlayerJoinPage';
import PlayerGamePage from './pages/PlayerGamePage';

// Protected Route Wrapper 
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return isAuth ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => {
  const hydrate = useAuthStore((s) => s.hydrate);

  // Restore auth session on app start.
  // hydrate() only reads the token from localStorage, then fetches user from DB.
  useEffect(() => {
    hydrate();
  }, []);


  return (
    <BrowserRouter>
      <Routes>
        {/* --------Public routes-------- */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/play" element={<PlayerJoinPage />} />
        <Route path="/play/:pin" element={<PlayerGamePage />} />

        {/*---------- Protected host route-----------s */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/host/:pin" element={<ProtectedRoute><HostGamePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );


};

export default App;
