import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Realistic logout delay
    await new Promise(r => setTimeout(r, 600));
    logout();
    setIsLoggingOut(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#1a3a6b] dark:bg-[#0a192f] text-white shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl">🚂</span>
            <span className="text-xl font-bold">
              Rail<span className="text-orange-400">Assist</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleTheme}
              className="p-2 mr-2 rounded-full hover:bg-white/10 transition-colors text-xl"
              title="Toggle Dark Mode"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  📊 Dashboard
                </Link>
                {user.role === 'PASSENGER' && (
                  <Link
                    to="/book"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/book')
                        ? 'bg-white/20 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    🧳 Request Assistance
                  </Link>
                )}

                <div className="flex items-center space-x-3 ml-4 border-l border-white/20 pl-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-300 text-sm hidden sm:block">
                      {user.name.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 w-[100px] justify-center"
                  >
                    {isLoggingOut ? (
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : (
                      <span>Logout</span>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
