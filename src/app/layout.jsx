import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'RailAssist - Railway Assistance Services',
  description: 'Book verified porters, wheelchairs, and meet & greet services at Indian railway stations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col justify-between">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-[#0f2347] text-gray-400 py-6 text-center text-sm border-t border-[#1a3a6b]">
              <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
                <p className="mb-1">🚂 RailAssist © {new Date().getFullYear()} · Making Indian Railway Travel Easier</p>
                <p className="text-orange-400 font-medium">Created by Madhav Kohli</p>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
