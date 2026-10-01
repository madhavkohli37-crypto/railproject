'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/axiosInstance';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [category, setCategory] = useState('ALL');
  const load = () => api.get('/notifications').then(response => setNotifications(response.data)).catch(() => {});
  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener('railassist:notification:new', refresh);
    return () => window.removeEventListener('railassist:notification:new', refresh);
  }, []);
  const visible = useMemo(() => category === 'ALL' ? notifications : notifications.filter(item => item.category === category), [category, notifications]);
  const markAll = async () => { await api.patch('/notifications', { all: true }); setNotifications(current => current.map(item => ({ ...item, read: true }))); };
  const markOne = async id => { await api.patch('/notifications', { id }); setNotifications(current => current.map(item => item.id === id ? { ...item, read: true } : item)); };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div><h1 className="text-3xl font-bold dark:text-white">Notifications</h1><p className="text-gray-500 dark:text-gray-400">Important alerts that may require your attention.</p></div>
        <button onClick={markAll} className="btn-outline text-sm">Mark all as read</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">{['ALL', 'BOOKINGS', 'COMPLAINTS', 'ACCOUNT', 'SYSTEM'].map(item => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-3 py-1 text-xs font-bold ${category === item ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200'}`}>{item}</button>)}</div>
      {visible.length === 0 ? <div className="card text-gray-500">No notifications in this category.</div> : <div className="space-y-3">{visible.map(item => <article key={item.id} className={`card ${item.read ? 'opacity-70' : 'border-l-4 border-orange-500'}`}><div className="flex justify-between gap-4"><div><h2 className="font-bold dark:text-white">{item.title}</h2><p className="text-sm text-gray-600 dark:text-gray-300">{item.message}</p></div>{!item.read && <button onClick={() => markOne(item.id)} className="text-xs text-blue-700">Mark read</button>}</div><p className="mt-2 text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</p></article>)}</div>}
    </div>
  );
}
