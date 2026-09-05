import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🚂</div>
          <p className="text-gray-500 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Component to dynamically route based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'PROVIDER') return <ProviderDashboard />;
  return <Dashboard />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/signup"    element={<SignupPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path="/book"      element={<ProtectedRoute allowedRoles={['PASSENGER']}><BookingPage /></ProtectedRoute>} />
        
        {/* Legacy redirect */}
        <Route path="/coolies"   element={<Navigate to="/book" replace />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Footer */}
      <footer className="bg-[#0f2347] text-gray-400 py-6 text-center text-sm border-t border-[#1a3a6b]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <p className="mb-1">🚂 RailAssist © {new Date().getFullYear()} · Making Indian Railway Travel Easier</p>
          <p className="text-orange-400 font-medium">Created by Madhav Kohli</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
