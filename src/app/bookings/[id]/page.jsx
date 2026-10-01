'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';
import BookingCard from '@/components/BookingCard';
import QuickChat from '@/components/QuickChat';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/bookings/${id}`)
      .then(response => setBooking(response.data))
      .catch(err => setError(err.response?.data?.error || 'Unable to load booking'));
  }, [id]);

  if (error) return <section className="mx-auto max-w-3xl px-4 py-10"><div className="card text-center text-red-600">{error}</div></section>;
  if (!booking) return <section className="mx-auto max-w-3xl px-4 py-10"><div className="card text-center text-gray-500">Loading booking…</div></section>;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/bookings" className="mb-5 inline-flex text-sm font-semibold text-blue-600 hover:underline">← Back to Booking History</Link>
      <h1 className="mb-2 text-3xl font-bold dark:text-white">Booking #{booking.id}</h1>
      <p className="mb-6 text-gray-500">Full booking details and service history.</p>
      <BookingCard booking={booking} perspective={user?.role === 'PROVIDER' ? 'PROVIDER' : 'PASSENGER'} />
      <div className="mt-4"><QuickChat bookingId={booking.id} disabled={['CANCELLED', 'COMPLETED', 'REJECTED_OR_CANCELLED'].includes(booking.status)} label="Open chat history" /></div>
    </section>
  );
}
