import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🧳', title: 'Coolie Booking', desc: 'Book certified railway porters at any major station with just a few clicks.' },
  { icon: '🔒', title: 'Verified Staff', desc: 'All coolies are government-registered with unique badge numbers for your safety.' },
  { icon: '💰', title: 'Fixed Pricing', desc: 'Transparent, fixed rates per bag. No haggling, no hidden charges.' },
  { icon: '📱', title: 'Easy Management', desc: 'Track and manage all your bookings from a single dashboard.' },
];

const stations = [
  { name: 'Mumbai CST', icon: '🏙️', coolies: 3 },
  { name: 'New Delhi', icon: '🏛️', coolies: 3 },
  { name: 'Bengaluru City', icon: '🌿', coolies: 2 },
  { name: 'Chennai Central', icon: '🌊', coolies: 2 },
  { name: 'Kolkata Howrah', icon: '🌉', coolies: 2 },
  { name: 'Hyderabad Deccan', icon: '🕌', coolies: 1 },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up in 30 seconds. No credit card needed.' },
  { num: '02', title: 'Choose Station', desc: 'Select your station and browse available coolies.' },
  { num: '03', title: 'Book & Confirm', desc: 'Enter train details, choose bags count, and confirm.' },
  { num: '04', title: 'Travel Easy', desc: 'Your coolie will be there to assist you.' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#0f2347] via-[#1a3a6b] to-[#1e4d8c] text-white py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-orange-400 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-400 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-orange-500/20 border border-orange-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-orange-300 text-sm font-medium">🚂 India's Trusted Railway Companion</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Travel Stress-Free
            <br />
            <span className="text-orange-400">with RailAssist</span>
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-10">
            Book certified railway porters (coolies) at major stations across India.
            Safe, transparent, and hassle-free railway travel assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link to="/coolies" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-orange-500/40">
                  🧳 Book a Coolie
                </Link>
                <Link to="/dashboard" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all">
                  📊 My Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-orange-500/40">
                  Get Started Free
                </Link>
                <Link to="/login" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { num: '16+', label: 'Coolies' },
              { num: '10+', label: 'Stations' },
              { num: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-orange-400">{stat.num}</div>
                <div className="text-blue-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose RailAssist?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Everything you need for a comfortable railway journey, all in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6 rounded-2xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors group">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATIONS */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Available Stations</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Serving major railway stations across India</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stations.map((s) => (
              <div key={s.name} className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 cursor-pointer">
                <div className="text-4xl mb-3">{s.icon}</div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{s.name}</h4>
                <p className="text-orange-500 text-xs font-medium mt-1">{s.coolies} coolies</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Book your coolie in under 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a3a6b] dark:bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step.num}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-[#1a3a6b] to-[#2563eb] dark:from-[#0f2347] dark:to-[#1a3a6b] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Travel Stress-Free?</h2>
          <p className="text-blue-200 text-lg mb-8">
            Join thousands of travellers who use RailAssist for a smooth railway experience.
          </p>
          {!user && (
            <Link
              to="/signup"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-lg"
            >
              Create Free Account →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
