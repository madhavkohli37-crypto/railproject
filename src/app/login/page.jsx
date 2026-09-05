'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';

const ROLE_CONFIG = {
  PASSENGER: {
    label: 'Passenger',
    icon: '🧳',
    color: 'from-[#1a3a6b] to-[#2563eb]',
    darkColor: 'dark:from-[#0f2347] dark:to-[#1a3a6b]',
    hint: 'Sign in with your passenger account to book assistance.',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  },
  PROVIDER: {
    label: 'Employee',
    icon: '👷',
    color: 'from-[#7c3aed] to-[#4f46e5]',
    darkColor: 'dark:from-[#4c1d95] dark:to-[#3730a3]',
    hint: 'Log in to your employee portal to manage your assigned jobs.',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  },
  ADMIN: {
    label: 'Master Admin',
    icon: '🛡️',
    color: 'from-[#991b1b] to-[#b45309]',
    darkColor: 'dark:from-[#7f1d1d] dark:to-[#92400e]',
    hint: 'Restricted access. Authorized personnel only.',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  },
};

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('PASSENGER');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const config = ROLE_CONFIG[selectedRole];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await new Promise(r => setTimeout(r, 700));
      const res = await api.post('/auth/login', form);
      const user = res.data.user;

      // Validate that the selected role matches what the backend returned
      const roleMap = {
        PASSENGER: ['PASSENGER'],
        PROVIDER: ['PROVIDER'],
        ADMIN: ['ADMIN'],
      };
      if (!roleMap[selectedRole].includes(user.role)) {
        setError(`This account is not registered as a ${config.label}. Please select the correct role.`);
        setLoading(false);
        return;
      }

      login(user, res.data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 transition-colors duration-300">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          
          {/* Dynamic Header by Role */}
          <div className={`bg-gradient-to-r ${config.color} ${config.darkColor} px-8 py-8 text-white text-center transition-all duration-500`}>
            <div className="text-4xl mb-3">{config.icon}</div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-white/70 text-sm mt-1">{config.hint}</p>
          </div>

          <div className="px-8 py-8 space-y-6">
            {/* Role Selector */}
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">I am a...</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => { setSelectedRole(role); setError(''); }}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                      selectedRole === role
                        ? `border-current ${cfg.badge} scale-105 shadow-md`
                        : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="text-xl mb-1">{cfg.icon}</span>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center space-x-2 animate-fade-in">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${config.color} ${config.darkColor} text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-lg shadow-sm hover:shadow-md active:scale-95 flex justify-center items-center h-14`}
              >
                {loading ? (
                  <span className="flex items-center space-x-2 animate-fade-in">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <span className="animate-fade-in">{config.icon} Sign In as {config.label}</span>
                )}
              </button>
            </form>

            {/* Footer Links */}
            {selectedRole === 'PASSENGER' && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-orange-500 hover:text-orange-600 font-semibold">
                  Create one free
                </Link>
              </div>
            )}

            {selectedRole === 'ADMIN' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg p-3 text-xs text-red-600 dark:text-red-400 text-center">
                🛡️ Admin credentials are stored securely in <code className="font-bold">admin.md</code>. Contact the system owner for access.
              </div>
            )}
            {selectedRole === 'PROVIDER' && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50 rounded-lg p-3 text-xs text-purple-600 dark:text-purple-400 text-center">
                👷 Employee accounts are created by the Master Admin. Contact your manager for credentials.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
