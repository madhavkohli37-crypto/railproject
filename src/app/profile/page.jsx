'use client';
import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', profile_picture: user?.profile_picture || null, currentPassword: '', newPassword: '', confirmPassword: '' });
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const selectPicture = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1024 * 1024) {
      setError('Choose a JPG, PNG, or WEBP image smaller than 1 MB.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm(current => ({ ...current, profile_picture: reader.result }));
    reader.onerror = () => setError('Unable to read that image.');
    reader.readAsDataURL(file);
  };
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
  const initials = (form.name || user?.name || '?').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  return <section className="mx-auto max-w-2xl px-4 py-8"><h1 className="mb-2 text-3xl font-bold dark:text-white">Account Settings</h1><p className="mb-6 text-gray-500">Update your profile, contact details, and password. Your User ID is permanent.</p><form onSubmit={submit} className="card space-y-5">{error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}{message && <p className="rounded-lg bg-green-50 p-3 text-green-700">{message}</p>}<div className="flex flex-wrap items-center gap-4"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xl font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">{form.profile_picture ? <img src={form.profile_picture} alt="Profile preview" className="h-full w-full object-cover" /> : initials}</div><div><p className="font-semibold dark:text-white">Profile picture <span className="text-sm font-normal text-gray-500">(optional)</span></p><div className="mt-2 flex gap-2"><button type="button" onClick={() => fileRef.current?.click()} className="btn-outline px-3 py-2 text-sm">Change photo</button>{form.profile_picture && <button type="button" onClick={() => setForm({ ...form, profile_picture: null })} className="btn-outline px-3 py-2 text-sm">Remove</button>}</div><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPicture} className="hidden" /></div></div><div><label className="label">User ID</label><input className="input-field bg-gray-100" value={user?.user_id || `U-${user?.id}`} disabled /></div><div><label className="label">Full name *</label><input className="input-field" name="name" value={form.name} onChange={change} required /></div><div><label className="label">Phone number *</label><input className="input-field" name="phone" value={form.phone} onChange={change} required /></div><div><label className="label">Email (optional)</label><input className="input-field" type="email" name="email" value={form.email} onChange={change} /></div><hr className="border-gray-200 dark:border-gray-700" /><h2 className="font-bold dark:text-white">Change password</h2><input className="input-field" type="password" name="currentPassword" placeholder="Current password" value={form.currentPassword} onChange={change} /><input className="input-field" type="password" name="newPassword" placeholder="New password (optional)" value={form.newPassword} onChange={change} minLength={6} /><input className="input-field" type="password" name="confirmPassword" placeholder="Confirm new password" value={form.confirmPassword} onChange={change} /><button className="btn-primary" type="submit">Save changes</button></form></section>;
}
