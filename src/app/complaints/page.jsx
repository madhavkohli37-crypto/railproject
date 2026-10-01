'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axiosInstance';
export default function ComplaintHistoryPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/complaints').then(response => setItems(response.data)).catch(() => {}); }, []);
  return <section className="max-w-5xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold dark:text-white mb-6">Complaint History</h1>{items.length ? <div className="space-y-3">{items.map(item => <article key={item.id} className="card"><div className="flex justify-between"><h2 className="font-bold dark:text-white">Complaint #{item.id}</h2><span className="text-sm text-blue-600">{item.status}</span></div><p className="mt-2 text-sm dark:text-gray-300">{item.description}</p><time className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</time></article>)}</div> : <div className="card text-gray-500">No complaints.</div>}</section>;
}
