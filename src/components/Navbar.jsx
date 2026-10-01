'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/book', label: 'Book Assistance', authOnly: true, roles: ['PASSENGER'] },
  { href: '/dashboard', label: 'My Dashboard', authOnly: true },
  { href: '/report', label: 'Report Activity', authOnly: true, roles: ['PASSENGER'] },
  { href: '/rewards', label: 'Rewards', authOnly: true, roles: ['PASSENGER'] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise(r => setTimeout(r, 600));
    logout();
    setIsLoggingOut(false);
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  const visibleLinks = NAV_LINKS.filter(link => {
    if (link.authOnly && !user) return false;
    if (link.roles && user && !link.roles.includes(user.role)) return false;
    return true;
  });

  const roleBadge = {
    ADMIN: { label: '🛡️ Admin', cls: 'bg-red-600 text-white' },
    PROVIDER: { label: '👷 Employee', cls: 'bg-purple-600 text-white' },
    PASSENGER: { label: '🧳 Passenger', cls: 'bg-blue-600 text-white' },
    MANAGER: { label: '🧭 Manager', cls: 'bg-teal-600 text-white' },
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* ── Top Info Bar ── */}
      <div className="bg-[#003087] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8">
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1">🚆 <span>Indian Railway Assistance Services</span></span>
            <span className="flex items-center gap-1 text-orange-300">⭐ Verified &amp; Trusted Platform</span>
          </div>
          <div className="flex items-center gap-3">
            {!user && (
              <>
                <Link href="/porter-apply" className="text-orange-300 hover:text-orange-200 font-medium transition-colors">
                  📋 Join as Porter
                </Link>
                <span className="text-white/30">|</span>
              </>
            )}
            <button onClick={toggleTheme} className="flex items-center gap-1 hover:text-orange-300 transition-colors">
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav className="bg-[#1a3a6b] dark:bg-[#0a1929] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 bg-[#E85D04] rounded-lg flex items-center justify-center text-xl font-extrabold shadow">
                🚂
              </div>
              <div className="leading-tight">
                <div className="text-base font-extrabold tracking-tight">
                  Rail<span className="text-[#E85D04]">Assist</span>
                </div>
                <div className="text-[9px] text-blue-300 -mt-0.5 hidden sm:block">RAILWAY ASSISTANCE PLATFORM</div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {visibleLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-white/20 text-white'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth section */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-full bg-[#E85D04] flex items-center justify-center font-bold text-sm shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="leading-tight">
                      <div className="text-white font-semibold text-sm">{user.name.split(' ')[0]}</div>
                      <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${roleBadge[user.role]?.cls}`}>
                        {roleBadge[user.role]?.label}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="bg-[#E85D04] hover:bg-[#d45200] disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 min-w-[90px] justify-center"
                  >
                    {isLoggingOut ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : 'Sign Out'}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-blue-200 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-[#E85D04] hover:bg-[#d45200] text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors">
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0f2a55] dark:bg-[#050f1e] px-4 py-4 space-y-1 animate-fade-in">
            {visibleLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href) ? 'bg-white/20 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link href="/porter-apply" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-orange-300 hover:bg-white/10">
                📋 Join as Porter
              </Link>
            )}
            <div className="pt-2 border-t border-white/10 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-[#E85D04] flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-semibold">{user.name}</span>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-white/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10">Login</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-bold text-white bg-[#E85D04] hover:bg-[#d45200]">Sign Up Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
