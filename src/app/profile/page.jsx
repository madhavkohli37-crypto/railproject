'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError(''); setMessage('');
    if (form.newPassword && form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return; }
    try {
      const res = await api.patch('/auth/profile', form);
      login(res.data.user, res.data.token);
      setForm({ ...form, ...res.data.user, currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Profile and credentials updated successfully.');
    } catch (err) { setError(err.response?.data?.error || 'Unable to update profile'); }
  };
  return <section className="max-w-2xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold dark:text-white mb-2">Account Settings</h1><p className="text-gray-500 mb-6">Update your contact details and password. Your User ID is permanent so bookings and history remain linked.</p><form onSubmit={submit} className="card space-y-5">{error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}{message && <p className="rounded-lg bg-green-50 p-3 text-green-700">{message}</p>}<div><label className="label">User ID</label><input className="input-field bg-gray-100" value={user?.user_id || `U-${user?.id}`} disabled /></div><div><label className="label">Full name *</label><input className="input-field" name="name" value={form.name} onChange={change} required /></div><div><label className="label">Phone number *</label><input className="input-field" name="phone" value={form.phone} onChange={change} required /></div><div><label className="label">Email (optional)</label><input className="input-field" type="email" name="email" value={form.email} onChange={change} /></div><hr className="border-gray-200 dark:border-gray-700" /><h2 className="font-bold dark:text-white">Change password</h2><input className="input-field" type="password" name="currentPassword" placeholder="Current password" value={form.currentPassword} onChange={change} /><input className="input-field" type="password" name="newPassword" placeholder="New password (optional)" value={form.newPassword} onChange={change} minLength={6} /><input className="input-field" type="password" name="confirmPassword" placeholder="Confirm new password" value={form.confirmPassword} onChange={change} /><button className="btn-primary" type="submit">Save changes</button></form></section>;
}
