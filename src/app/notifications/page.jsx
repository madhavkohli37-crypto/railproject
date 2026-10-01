'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axiosInstance';
export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/notifications').then(response => setItems(response.data)).catch(() => {}); }, []);
  return <section className="max-w-4xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold dark:text-white mb-6">Notifications</h1>{items.length ? <div className="space-y-3">{items.map(item => <article key={item.id} className="card border-l-4 border-blue-500"><div className="flex justify-between gap-3"><h2 className="font-bold dark:text-white">{item.title}</h2><time className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</time></div><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.message}</p></article>)}</div> : <div className="card text-gray-500">No notifications.</div>}</section>;
}
