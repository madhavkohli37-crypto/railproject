'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';
import BookingChat from '@/components/BookingChat';

export default function BookingChatPage({ params }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [id, setId] = useState(null);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { Promise.resolve(params).then(value => setId(value.id)); }, [params]);
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
    if (!id || !user) return undefined;
    api.get(`/bookings/${id}`).then(res => setBooking(res.data)).catch(err => setError(err.response?.data?.error || 'Unable to open chat'));
  }, [authLoading, user, id, router]);
  if (authLoading || !id) return <div className="p-10 text-center text-gray-500">Loading chat…</div>;
  if (!booking) return <div className="mx-auto max-w-2xl px-4 py-10 text-center text-red-600">{error || 'Unable to open chat'}</div>;
  const terminal = ['CANCELLED', 'COMPLETED', 'REJECTED_OR_CANCELLED'].includes(booking.status);
  const counterparty = user?.role === 'PROVIDER' ? booking.passenger : booking.services?.find(service => service.provider_name) && {
    name: booking.services.find(service => service.provider_name).provider_name,
    profile_picture: booking.services.find(service => service.provider_name).provider_profile_picture,
  };
  const chatBooking = { ...booking, counterparty };
  return <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col px-4 py-5"><Link href={`/active-booking/${id}`} className="mb-4 text-sm font-semibold text-blue-600">← Back to Active Service</Link><div className="mb-4"><h1 className="text-2xl font-bold dark:text-white">Chat</h1><p className="text-sm text-gray-500">Booking #{id} · {booking.status.replace(/_/g, ' ')}</p></div><div className="flex-1"><BookingChat booking={chatBooking} disabled={terminal} /></div></main>;
}
