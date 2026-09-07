'use client';

import Link from 'next/link';

const SERVICES = [
  {
    icon: '🧳',
    title: 'Porter / Coolie Service',
    description: 'Licensed red-coat porters to carry your luggage from platform to exit. Priced per bag, transparent rates.',
    rate: 'From ₹60/bag',
    color: 'border-[#E85D04]',
  },
  {
    icon: '♿',
    title: 'Wheelchair Assistance',
    description: 'Trained attendants with clean wheelchairs for elderly passengers, differently-abled travellers, and medical cases.',
    rate: 'From ₹150/trip',
    color: 'border-blue-500',
  },
  {
    icon: '🤝',
    title: 'Meet & Greet',
    description: 'Station representatives who receive you at the train, guide you through the station, and help with connections.',
    rate: 'From ₹250/visit',
    color: 'border-green-500',
  },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '📱', title: 'Register', desc: 'Create your free passenger account in under 2 minutes.' },
  { step: '02', icon: '🏙️', title: 'Select Station', desc: 'Choose your departure or arrival railway station.' },
  { step: '03', icon: '📋', title: 'Book Service', desc: 'Pick porter, wheelchair, or meet & greet. Add your train details.' },
  { step: '04', icon: '✅', title: 'Get Assisted', desc: 'A verified employee meets you on arrival. Pay after service.' },
];

const STATS = [
  { value: '50+', label: 'Major Stations' },
  { value: '1000+', label: 'Verified Porters' },
  { value: '2L+', label: 'Journeys Assisted' },
  { value: '4.8★', label: 'Avg. Rating' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', city: 'Mumbai', text: 'Booked a wheelchair for my mother at New Delhi station. The porter was on time, polite, and very helpful. Highly recommend!', rating: 5 },
  { name: 'Rajesh Kumar', city: 'Delhi', text: 'Used the Meet & Greet service for the first time. The attendant was already waiting when my train arrived. Excellent service.', rating: 5 },
  { name: 'Anita Patel', city: 'Ahmedabad', text: 'Three heavy bags and two kids — the porter handled everything professionally. Great value for money!', rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* ─────────── HERO ─────────── */}
      <section className="bg-gradient-to-br from-[#003087] via-[#1a3a6b] to-[#0a2240] text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,.3) 40px, rgba(255,255,255,.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,.3) 40px, rgba(255,255,255,.3) 41px)'}} />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-blue-200 mb-6">
            🚆 Official Railway Assistance Platform · Est. 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Travel Stress-Free<br />
            <span className="text-[#E85D04]">on Indian Railways</span>
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Book verified porters, wheelchair attendants & meet-and-greet services at 50+ major stations — instantly, transparently, safely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link href="/signup" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-orange-900/30">
              🧳 Book Assistance Now
            </Link>
            <Link href="/about" className="border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-lg transition-all inline-flex items-center gap-2">
              ℹ️ Learn More
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl px-4 py-4">
                <div className="text-3xl font-extrabold text-[#E85D04]">{s.value}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── SERVICES ─────────── */}
      <section className="py-20 px-4 bg-white dark:bg-[#111827]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="ir-divider mx-auto" />
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Professionally managed, government-compliant assistance services at every major railway station.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.map(s => (
              <div key={s.title} className={`ir-card border-t-4 ${s.color} hover:shadow-lg transition-all group`}>
                <div className="p-6">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">{s.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold px-3 py-1 rounded-full">{s.rate}</span>
                    <Link href="/signup" className="text-[#003087] dark:text-blue-400 text-sm font-semibold hover:underline">Book Now →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="py-20 px-4 bg-[#f0f4ff] dark:bg-[#0d1b2a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="ir-divider mx-auto" />
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle max-w-lg mx-auto">Get assistance in 4 simple steps. No cash needed, no haggling.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-[#E85D04]/30 z-0 -translate-y-1/2" />
                )}
                <div className="card text-center relative z-10 hover:shadow-md transition-all">
                  <div className="text-xs font-bold text-[#E85D04] tracking-widest mb-2">STEP {step.step}</div>
                  <div className="text-4xl mb-3">{step.icon}</div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── TRUST SIGNALS ─────────── */}
      <section className="py-16 px-4 bg-white dark:bg-[#111827]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🛡️', title: 'Badge-Verified Porters', desc: 'All porters carry official Indian Railways badge numbers, verified by station management.' },
              { icon: '💳', title: 'Fixed Transparent Rates', desc: 'No hidden charges. Rate cards displayed upfront. Pay only after service is delivered.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Your personal data is encrypted. We never share your information with third parties.' },
            ].map(t => (
              <div key={t.title} className="flex gap-4 p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                <div className="text-3xl shrink-0">{t.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">{t.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <section className="py-20 px-4 bg-[#f0f4ff] dark:bg-[#0d1b2a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="ir-divider mx-auto" />
            <h2 className="section-title">What Passengers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card hover:shadow-md transition-all">
                <div className="flex text-[#E85D04] text-lg mb-3">{'★'.repeat(t.rating)}</div>
                <p className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="w-8 h-8 rounded-full bg-[#003087] text-white flex items-center justify-center font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm dark:text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── PORTER RECRUITMENT CTA ─────────── */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#E85D04] to-[#c44d00]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <h2 className="text-3xl font-extrabold mb-2">Are You a Licensed Porter?</h2>
            <p className="text-orange-100 text-lg">Join RailAssist to get more bookings, digital payments, and grow your income.</p>
            <ul className="mt-4 space-y-1 text-orange-100 text-sm">
              <li>✅ Free registration</li>
              <li>✅ Digital payment directly to your account</li>
              <li>✅ More customers, regular income</li>
            </ul>
          </div>
          <Link href="/porter-apply" className="shrink-0 bg-white text-[#E85D04] hover:bg-orange-50 font-extrabold px-8 py-4 rounded-xl text-lg shadow-xl transition-all active:scale-95 whitespace-nowrap">
            📋 Apply as Porter →
          </Link>
        </div>
      </section>

      {/* ─────────── FINAL CTA ─────────── */}
      <section className="py-20 px-4 bg-white dark:bg-[#111827] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="section-title text-3xl md:text-4xl">Ready to Travel Stress-Free?</h2>
          <p className="section-subtitle mb-8">Join thousands of passengers who trust RailAssist for their railway journeys.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-base px-8 py-3.5">🚀 Create Free Account</Link>
            <Link href="/about" className="btn-outline text-base px-8 py-3.5">Learn More About Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
