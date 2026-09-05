'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'PASSENGER', provider_type: 'PORTER', station: 'New Delhi' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { confirmPassword, ...payload } = form;
      const res = await api.post('/auth/signup', payload);
      login(res.data.user, res.data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 transition-colors duration-300">
      <div className="w-full max-w-xl animate-slide-up">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Left/Top visual panel */}
            <div className="bg-gradient-to-br from-[#1a3a6b] to-[#2563eb] dark:from-[#0f2347] dark:to-[#1a3a6b] text-white p-8 md:col-span-2 flex flex-col justify-center text-center md:text-left">
              <div className="text-4xl mb-4 text-center md:text-left">🚂</div>
              <h2 className="text-2xl font-bold mb-2">Join RailAssist</h2>
              <p className="text-blue-100 text-sm">Experience seamless railway assistance services.</p>
              <div className="mt-8 hidden md:block">
                <div className="flex items-center space-x-3 text-sm text-blue-100 mb-3"><span className="text-orange-400">✓</span><span>Quick booking</span></div>
                <div className="flex items-center space-x-3 text-sm text-blue-100 mb-3"><span className="text-orange-400">✓</span><span>Verified providers</span></div>
                <div className="flex items-center space-x-3 text-sm text-blue-100"><span className="text-orange-400">✓</span><span>Secure payments</span></div>
              </div>
            </div>

            {/* Right/Bottom form panel */}
            <div className="p-8 md:col-span-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create your account</h3>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center space-x-2 animate-fade-in">
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address <span className="text-red-400">*</span></label>
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password <span className="text-red-400">*</span></label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password <span className="text-red-400">*</span></label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-[#1a3a6b] hover:bg-[#14305a] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-lg shadow-sm hover:shadow-md active:scale-95 flex justify-center items-center h-14"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2 animate-fade-in">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      <span>Creating Account...</span>
                    </span>
                  ) : (
                    <span className="animate-fade-in">🚀 Create Account</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-orange-500 hover:text-orange-600 font-semibold">
                  Sign In
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
