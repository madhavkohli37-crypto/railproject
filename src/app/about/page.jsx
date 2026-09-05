import Link from 'next/link';

export const metadata = {
  title: 'About — RailAssist | India\'s Railway Assistance Platform',
  description: 'Learn about RailAssist — how we connect railway passengers with licensed porters, wheelchair assistants, and meet-and-greet service providers.',
};

const FEATURES = [
  { icon: '🧳', title: 'Porter Booking', desc: 'Digitally book a licensed red-coat railway coolie to carry your luggage to/from the platform. Transparent per-bag pricing.' },
  { icon: '♿', title: 'Wheelchair Service', desc: 'Pre-book a trained wheelchair attendant for elderly passengers, patients, or differently-abled travellers at major stations.' },
  { icon: '🤝', title: 'Meet & Greet', desc: 'A station representative receives you at the train and escorts you to your exit, taxi, or connecting platform.' },
  { icon: '📱', title: 'Digital & Instant', desc: 'Book in seconds via your phone. No cash needed at the station — all payments processed digitally.' },
  { icon: '🛡️', title: 'Verified Workforce', desc: 'Every porter carries an official Indian Railways badge. Their identity and license are verified before onboarding.' },
  { icon: '📊', title: 'Live Status Updates', desc: 'Track your booking status in real-time. Get notified when your helper is assigned and on the way.' },
];

const TEAM_REASONS = [
  'Indian Railways carries over 23 million passengers daily across 7,500+ stations.',
  'Elderly, disabled, and first-time travellers often struggle to find and negotiate with porters.',
  'Porter wages are unregulated — passengers often overpay or get scammed.',
  'There was no trusted, digital platform to book certified railway helpers.',
];

const PORTER_BENEFITS = [
  { icon: '💰', title: 'Better Income', desc: 'Access a steady flow of pre-booked customers. No more waiting and competing on the platform.' },
  { icon: '📲', title: 'Digital Payments', desc: 'Receive earnings directly to your bank account or UPI. No cash handling.' },
  { icon: '⭐', title: 'Build Reputation', desc: 'Your rating grows with each completed job. Higher-rated porters get priority bookings.' },
  { icon: '🔒', title: 'Job Security', desc: 'Registered porters on our platform get consistent work all year round, not just peak season.' },
];

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-br from-[#003087] to-[#1a3a6b] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6">
              ℹ️ About RailAssist
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Making Every<br />
              <span className="text-[#E85D04]">Railway Journey Easier</span>
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed max-w-2xl mb-8">
              RailAssist is India's first dedicated digital platform for booking verified railway assistance services — porters, wheelchair attendants, and station guides — at 50+ major Indian railway stations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="btn-primary px-7 py-3">🧳 Start Booking</Link>
              <Link href="/porter-apply" className="border-2 border-white/40 text-white hover:bg-white/10 font-bold px-7 py-3 rounded-lg transition-all inline-flex items-center gap-2">
                📋 Join as Porter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why We Built This ─── */}
      <section className="py-20 px-4 bg-white dark:bg-[#111827]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="ir-divider" />
            <h2 className="section-title">Why RailAssist Exists</h2>
            <p className="section-subtitle mb-8">
              Indian Railways is the lifeline of our nation. But for millions of passengers — especially the elderly, families with young children, and differently-abled travellers — navigating a large railway station can be overwhelming.
            </p>
            <ul className="space-y-4">
              {TEAM_REASONS.map((r, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E85D04] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{r}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 p-5 bg-[#f0f4ff] dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
              <p className="text-[#003087] dark:text-blue-300 font-semibold">
                &ldquo;RailAssist was built to solve a real, everyday problem — making railway stations accessible to everyone, and ensuring every porter gets a fair, steady income.&rdquo;
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">— Madhav Kohli, Founder</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '50+', label: 'Major Stations Covered' },
              { num: '1000+', label: 'Verified Porters' },
              { num: '2,00,000+', label: 'Journeys Assisted' },
              { num: '4.8★', label: 'Average Service Rating' },
              { num: '3', label: 'Service Types Offered' },
              { num: '24×7', label: 'Support Available' },
            ].map(s => (
              <div key={s.label} className="ir-card">
                <div className="p-5 text-center">
                  <div className="text-3xl font-extrabold text-[#E85D04]">{s.num}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Platform Features ─── */}
      <section className="py-20 px-4 bg-[#f0f4ff] dark:bg-[#0d1b2a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="ir-divider mx-auto" />
            <h2 className="section-title">What We Offer</h2>
            <p className="section-subtitle max-w-xl mx-auto">A complete digital railway assistance ecosystem for passengers and service providers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="card hover:shadow-md transition-all group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── For Porters ─── */}
      <section className="py-20 px-4 bg-white dark:bg-[#111827]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="ir-divider" />
              <h2 className="section-title">Empowering Railway Porters</h2>
              <p className="section-subtitle mb-8">
                RailAssist is not just for passengers. We believe licensed railway porters deserve better tools, better pay, and more dignity in their work.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {PORTER_BENEFITS.map(b => (
                  <div key={b.title} className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30">
                    <div className="text-2xl mb-2">{b.icon}</div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{b.title}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{b.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/porter-apply" className="btn-primary px-8 py-3.5 text-base">
                📋 Apply as Porter — It&apos;s Free
              </Link>
            </div>

            <div className="space-y-5">
              <div className="ir-card">
                <div className="ir-card-header">Application Process</div>
                <div className="p-5 space-y-4">
                  {[
                    { icon: '📝', title: 'Fill Application', desc: 'Submit your details, service type, and preferred station.' },
                    { icon: '🔍', title: 'Admin Review', desc: 'Our team verifies your identity and railway badge within 24-48 hours.' },
                    { icon: '✅', title: 'Account Activation', desc: 'Once approved, log in and start receiving booking assignments.' },
                    { icon: '💰', title: 'Earn & Grow', desc: 'Complete bookings, earn ratings, and grow your digital profile.' },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#f0f4ff] dark:bg-blue-900/30 flex items-center justify-center text-xl shrink-0">
                        {step.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold dark:text-white text-sm">{step.title}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-16 px-4 bg-[#003087] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-4">Start Your Journey With Us</h2>
          <p className="text-blue-200 mb-8">Whether you're a passenger looking for help, or a porter looking for better opportunities — RailAssist is built for you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-[#E85D04] hover:bg-[#d45200] text-white font-bold px-8 py-3.5 rounded-lg transition-all">
              🧳 Register as Passenger
            </Link>
            <Link href="/porter-apply" className="border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-lg transition-all">
              📋 Apply as Porter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
