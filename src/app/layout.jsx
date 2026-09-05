import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://railassist.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RailAssist - India\'s Railway Assistance Platform',
    template: '%s | RailAssist',
  },
  description: 'RailAssist is India\'s trusted railway assistance platform. Book verified porters (coolies), wheelchair assistants, and meet & greet services at Indian railway stations.',
  keywords: [
    'RailAssist',
    'railassist',
    'rail assist',
    'railway porter booking',
    'coolie booking online',
    'irctc coolie assistance',
    'railway wheelchair booking',
    'station assistance service',
    'indian railway assistance',
    'madhav kohli railassist'
  ],
  authors: [{ name: 'Madhav Kohli' }],
  creator: 'Madhav Kohli',
  publisher: 'RailAssist',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'RailAssist - India\'s Railway Assistance Platform',
    description: 'Book verified porters, wheelchair attendants, and meet & greet services at 50+ Indian railway stations.',
    url: siteUrl,
    siteName: 'RailAssist',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RailAssist - Railway Assistance Services',
    description: 'Making Indian Railway travel easier for senior citizens, families, and solo travellers.',
  },
};


export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'RailAssist',
    url: siteUrl,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'All',
    description: 'Book verified railway porters, wheelchair assistance, and meet & greet services across Indian railway stations.',
    author: {
      '@type': 'Person',
      name: 'Madhav Kohli',
    },
    offers: {
      '@type': 'Offer',
      price: '60',
      priceCurrency: 'INR',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#f5f7fa] dark:bg-[#0d1b2a] text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col justify-between">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>


            {/* ── Footer ── */}
            <footer className="bg-[#003087] text-white mt-auto">
              {/* Main Footer Grid */}
              <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Brand */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 bg-[#E85D04] rounded-lg flex items-center justify-center text-xl font-extrabold">🚂</div>
                    <span className="text-xl font-extrabold">Rail<span className="text-[#E85D04]">Assist</span></span>
                  </div>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    India&apos;s trusted railway assistance platform — connecting passengers with verified porters and station helpers.
                  </p>
                  <p className="mt-3 text-orange-400 font-semibold text-sm">Created by Madhav Kohli</p>
                </div>

                {/* Services */}
                <div>
                  <h4 className="font-bold text-white mb-3 uppercase text-xs tracking-widest border-b border-white/20 pb-2">Services</h4>
                  <ul className="space-y-2 text-blue-200 text-sm">
                    <li>🧳 Porter / Coolie Booking</li>
                    <li>♿ Wheelchair Assistance</li>
                    <li>🤝 Meet &amp; Greet Service</li>
                    <li>🚉 Station Navigation Help</li>
                  </ul>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-bold text-white mb-3 uppercase text-xs tracking-widest border-b border-white/20 pb-2">Quick Links</h4>
                  <ul className="space-y-2 text-sm">
                    {[
                      { href: '/', label: 'Home' },
                      { href: '/about', label: 'About Us' },
                      { href: '/signup', label: 'Register as Passenger' },
                      { href: '/porter-apply', label: 'Apply as Porter' },
                      { href: '/login', label: 'Sign In' },
                    ].map(l => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-blue-200 hover:text-white transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact / Info */}
                <div>
                  <h4 className="font-bold text-white mb-3 uppercase text-xs tracking-widest border-b border-white/20 pb-2">Support</h4>
                  <ul className="space-y-2 text-blue-200 text-sm">
                    <li>📞 Helpline: 1800-110-139</li>
                    <li>📧 support@railassist.in</li>
                    <li>⏰ 24×7 Available</li>
                  </ul>
                  <div className="mt-4 p-3 bg-white/10 rounded-lg">
                    <p className="text-xs text-blue-200">Railway Porter Booking is regulated under the Indian Railways Act 1989. All porters are licensed &amp; badge-verified.</p>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-white/20 py-4">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-blue-300">
                  <p>© {new Date().getFullYear()} RailAssist · All rights reserved</p>
                  <p>Made with ❤️ for Indian Railways travellers</p>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
