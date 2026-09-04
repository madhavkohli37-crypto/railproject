import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#1a3a6b] text-white shadow-lg sticky top-0 z-50">
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
                <Link
                  to="/coolies"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/coolies')
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  🧳 Book Coolie
                </Link>

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
                    className="bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Logout
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
