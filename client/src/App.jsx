// ============================================
// App.jsx - Root Component with Routing
// ============================================
// Sets up BrowserRouter, AuthProvider, global toast,
// and all client-side routes with route guards.
// ============================================

import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import Landing from './pages/Landing';
import LoadingSpinner from './components/common/LoadingSpinner';
import TransitionWrapper from './components/common/TransitionWrapper';

// ── Route Guards ────────────────────────────────────────────

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  if (user) {
    return children;
  }
  return <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ── Route Definitions ───────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<TransitionWrapper><Landing /></TransitionWrapper>} />
    <Route path="/login" element={<PublicRoute><TransitionWrapper><Login /></TransitionWrapper></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><TransitionWrapper><Register /></TransitionWrapper></PublicRoute>} />
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <ChatProvider>
            <TransitionWrapper>
              <Dashboard />
            </TransitionWrapper>
          </ChatProvider>
        </PrivateRoute>
      }
    />
    <Route
      path="/chat/:id"
      element={
        <PrivateRoute>
          <ChatProvider>
            <TransitionWrapper>
              <ChatPage />
            </TransitionWrapper>
          </ChatProvider>
        </PrivateRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Animated 3D Floating Mesh Background (Light Theme with Royal Blue/Indigo and Gold) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#f8fafc]">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-indigo-200/40 to-purple-300/35 blur-[100px] animate-float-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-amber-100/50 to-yellow-200/40 blur-[120px] animate-float-medium"></div>
          <div className="absolute top-[40%] left-[30%] w-[35%] h-[35%] rounded-full bg-gradient-to-tr from-indigo-100/40 to-blue-200/35 blur-[90px] animate-float-fast"></div>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#ffffff', color: '#1e293b', fontSize: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' },
            success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
