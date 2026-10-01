'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axiosInstance';
import BookingCard from '@/components/BookingCard';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get('/bookings/my').then(response => setBookings(response.data)).catch(() => {}); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold dark:text-white mb-2">Booking History</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Completed and cancelled Porter, Wheelchair, and Meet &amp; Greet bookings.</p>
      {bookings.length === 0
        ? <div className="card text-gray-500">No bookings yet.</div>
        : <div className="grid gap-5 md:grid-cols-2">{bookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}</div>}
    </div>
  );
}
