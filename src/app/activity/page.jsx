'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axiosInstance';
export default function ActivityPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/activity').then(response => setItems(response.data)).catch(() => {}); }, []);
  return <section className="max-w-5xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold dark:text-white mb-6">Account Activity</h1>{items.length ? <div className="space-y-3">{items.map((item, index) => <article key={item.id || index} className="card"><div className="font-semibold dark:text-white">{String(item.action || 'Activity').replaceAll('_', ' ')}</div><p className="text-sm text-gray-500">{item.details}</p><time className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</time></article>)}</div> : <div className="card text-gray-500">No account activity.</div>}</section>;
}
