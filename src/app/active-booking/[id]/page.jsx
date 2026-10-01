'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import api from '@/lib/axiosInstance';
import BookingCard from '@/components/BookingCard';
import QuickChat from '@/components/QuickChat';

export default function ActiveServicePage({ params }) {
  const { user, loading: authLoading } = useAuth();
  const { setActiveBooking } = useBooking();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [id, setId] = useState(null);

  useEffect(() => { Promise.resolve(params).then(value => setId(value.id)); }, [params]);
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
    if (!id || !user) return undefined;
    api.get(`/bookings/${id}`).then(res => {
      setBooking(res.data);
      if (res.data.active) setActiveBooking(res.data);
    }).catch(err => setError(err.response?.data?.error || 'Unable to load this booking')).finally(() => setLoading(false));
  }, [authLoading, user, id, router, setActiveBooking]);

  useEffect(() => {
    if (!id) return undefined;
    const receive = event => {
      const incoming = event.detail?.booking;
      if (!incoming || String(incoming.id) !== String(id)) return;
      setBooking(current => ({ ...(current || {}), ...incoming }));
      if (['CANCELLED', 'COMPLETED', 'REJECTED_OR_CANCELLED'].includes(incoming.status)) setActiveBooking(null);
      else setActiveBooking(current => ({ ...(current || {}), ...incoming }));
    };
    ['accepted', 'updated', 'arrived', 'started', 'completed', 'cancelled'].forEach(name => window.addEventListener(`railassist:booking:${name}`, receive));
    return () => ['accepted', 'updated', 'arrived', 'started', 'completed', 'cancelled'].forEach(name => window.removeEventListener(`railassist:booking:${name}`, receive));
  }, [id, setActiveBooking]);

  if (authLoading || loading) return <div className="mx-auto max-w-5xl px-4 py-12 text-center text-gray-500">Loading active service…</div>;
  if (!booking) return <section className="mx-auto max-w-3xl px-4 py-12"><div className="card text-center"><h1 className="text-2xl font-bold dark:text-white">Unable to open service</h1><p className="mt-2 text-red-600">{error}</p><Link href="/dashboard" className="btn-primary mt-5 inline-flex">Back to dashboard</Link></div></section>;

  const terminal = ['CANCELLED', 'COMPLETED', 'REJECTED_OR_CANCELLED'].includes(booking.status);
  const isProvider = user?.role === 'PROVIDER';
  const provider = booking.services?.find(service => service.provider_name)?.provider_name;
  const counterpartName = isProvider ? booking.passenger?.name : provider;
  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between"><Link href="/dashboard" className="text-sm font-semibold text-blue-600">← Back</Link><span className="text-xs font-bold uppercase tracking-widest text-gray-500">Active Service</span><span className="w-12" /></div>
      <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-5">
          <div className="card"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Current service</p><h1 className="text-2xl font-bold dark:text-white">{booking.services?.[0]?.type?.replace(/_/g, ' ') || 'Railway Assistance'}</h1></div><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{booking.status.replace(/_/g, ' ')}</span></div><BookingCard booking={booking} perspective={user?.role === 'PROVIDER' ? 'PROVIDER' : 'PASSENGER'} /></div>
          <div className="card"><h2 className="mb-5 text-lg font-bold dark:text-white">Service progress</h2><div className="relative grid grid-cols-4 gap-2 text-center text-xs"><div className="pointer-events-none absolute left-[12%] right-[12%] top-4 h-1 rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-700" style={{ width: booking.status === 'ACCEPTED' ? '0%' : booking.status === 'ARRIVED' ? '33%' : ['STARTED', 'IN_PROGRESS'].includes(booking.status) ? '66%' : booking.status === 'COMPLETED' ? '100%' : '0%' }} /></div>{['ACCEPTED', 'ARRIVED', 'STARTED', 'COMPLETED'].map((stage, index) => { const reached = booking.status === stage || (['ARRIVED', 'STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status) && index === 0) || (['STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status) && index === 1) || (booking.status === 'COMPLETED' && index === 2); return <div key={stage} className="relative z-10"><div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white shadow-sm transition-all duration-500 dark:border-gray-800 ${reached ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>{reached ? '✓' : index + 1}</div><span className={reached ? 'font-semibold text-green-700 dark:text-green-300' : 'text-gray-500'}>{stage === 'ARRIVED' ? 'On the way' : stage.replace(/_/g, ' ')}</span></div>; })}</div></div>
          <div className="card"><h2 className="mb-3 text-lg font-bold dark:text-white">Booking information</h2><div className="grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-gray-500">Booking ID</span><br /><b>#{booking.id}</b></p><p><span className="text-gray-500">Station</span><br /><b>{booking.station}</b></p><p><span className="text-gray-500">Requested</span><br /><b>{new Date(booking.created_at).toLocaleString('en-IN')}</b></p><p><span className="text-gray-500">Train / Platform</span><br /><b>{booking.train_number || '—'} / {booking.platform || '—'}</b></p></div></div>
        </div>
        <aside className="space-y-5"><div className="card"><h2 className="mb-3 text-lg font-bold dark:text-white">{counterpartName ? (isProvider ? 'Passenger assigned' : 'Provider assigned') : 'Finding a provider'}</h2><p className="mb-4 text-sm text-gray-500">{counterpartName || 'Your request is being matched with an available employee.'}</p><QuickChat bookingId={booking.id} disabled={terminal} label={counterpartName ? `Chat with ${counterpartName.split(' ')[0]}` : 'Open chat'} /></div>{terminal && <div className="card text-sm text-gray-500">This service has ended. Previous messages remain available.</div>}</aside>
      </div>
    </main>
  );
}
