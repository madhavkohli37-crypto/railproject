'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import api from '@/lib/axiosInstance';
import BookingCard from '@/components/BookingCard';

const ACTIVE = new Set(['REQUESTED', 'SEARCHING', 'ASSIGNED', 'PARTIALLY_ASSIGNED', 'ACCEPTED', 'ARRIVED', 'STARTED', 'IN_PROGRESS']);

export default function ActiveBookingPage() {
  const { user, loading: authLoading } = useAuth();
  const { activeBooking, setActiveBooking } = useBooking();
  const router = useRouter();
  const [booking, setBooking] = useState(activeBooking);
  const [loading, setLoading] = useState(!activeBooking);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return undefined;
    const id = activeBooking?.id || booking?.id;
    if (id) {
      router.replace(`/active-booking/${id}`);
      return undefined;
    }
    if (!id) {
      api.get(user.role === 'PROVIDER' ? '/provider/dashboard' : '/bookings/my')
        .then(res => {
          const found = (res.data || []).find(item => ACTIVE.has(item.status || item.overall_status));
          if (found) {
            const normalized = found.booking || found;
            setBooking(normalized);
            setActiveBooking(normalized);
            router.replace(`/active-booking/${normalized.id || normalized.booking_id}`);
          }
        })
        .catch(() => setError('Unable to load the active service'))
        .finally(() => setLoading(false));
      return undefined;
    }
    api.get(`/bookings/${id}`)
      .then(res => { setBooking(res.data); setActiveBooking(res.data); })
      .catch(err => setError(err.response?.data?.error || 'Unable to load the active service'))
      .finally(() => setLoading(false));
  }, [user, activeBooking?.id, setActiveBooking, router]);

  useEffect(() => {
    const apply = event => {
      const incoming = event.detail?.booking;
      if (!incoming || (booking?.id && String(incoming.id) !== String(booking.id))) return;
      if (['COMPLETED', 'CANCELLED', 'REJECTED_OR_CANCELLED'].includes(incoming.status)) {
        setBooking(current => ({ ...(current || {}), ...incoming }));
        setActiveBooking(null);
      } else {
        setBooking(current => ({ ...(current || {}), ...incoming }));
        setActiveBooking(current => ({ ...(current || {}), ...incoming }));
      }
    };
    const events = ['accepted', 'updated', 'arrived', 'started', 'completed', 'cancelled'];
    events.forEach(name => window.addEventListener(`railassist:booking:${name}`, apply));
    return () => events.forEach(name => window.removeEventListener(`railassist:booking:${name}`, apply));
  }, [booking?.id, setActiveBooking]);

  if (authLoading || loading) return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">Loading active service…</div>;
  if (error || !booking) return <section className="mx-auto max-w-3xl px-4 py-12"><div className="card text-center"><h1 className="text-2xl font-bold dark:text-white">No Active Service</h1><p className="mt-2 text-gray-500">{error || 'There is no active booking for this account.'}</p><button onClick={() => router.push('/dashboard')} className="btn-primary mt-5">Go to dashboard</button></div></section>;

  const terminal = ['CANCELLED', 'COMPLETED', 'REJECTED_OR_CANCELLED'].includes(booking.status);
  const statusLabel = { SEARCHING: 'Searching for Provider', ACCEPTED: 'Provider Found', ARRIVED: 'Provider Reached', STARTED: 'Service In Progress', IN_PROGRESS: 'Service In Progress', COMPLETED: 'Completed', CANCELLED: 'Booking Cancelled' }[booking.status] || booking.status.replace(/_/g, ' ');
  return (
    <section className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Live service</p><h1 className="text-3xl font-bold dark:text-white">Active Booking</h1></div><span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">{statusLabel}</span></div>
      <div className="card"><BookingCard booking={booking} /></div>
      {terminal && <button onClick={() => router.push('/bookings')} className="btn-outline">View booking history</button>}
    </section>
  );
}
