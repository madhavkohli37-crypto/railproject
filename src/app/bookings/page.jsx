'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axiosInstance';
import BookingCard from '@/components/BookingCard';

export default function BookingHistoryPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/bookings/my').then(response => setItems(response.data.filter(item => ['COMPLETED', 'CANCELLED', 'REJECTED_OR_CANCELLED'].includes(item.status)))).catch(() => {}); }, []);
  return <section className="max-w-6xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold dark:text-white mb-2">Booking History</h1><p className="text-gray-500 mb-6">Completed and cancelled assistance bookings.</p>{items.length ? <div className="grid gap-5 md:grid-cols-2">{items.map(item => <BookingCard key={item.id} booking={item} />)}</div> : <div className="card text-gray-500">No historical bookings.</div>}</section>;
}
