'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';

const PLANS = ['1 Day', '1 Week', '1 Month', '6 Months', '1 Year'];

export default function PremiumApplicationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ plan: '1 Month', name: '', email: '', phone: '', usage: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const selectedPlan = new URLSearchParams(window.location.search).get('plan');
    if (!loading && (!user || user.role !== 'PASSENGER')) router.push('/login');
    if (user) setForm(current => ({ ...current, plan: selectedPlan || current.plan, name: current.name || user.name || '', email: current.email || user.email || '', phone: current.phone || user.phone || '' }));
  }, [loading, user, router]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/premium/applications', form);
      setMessage('Your RailAssist Premium application has been submitted. The team will review it and contact you with the next steps.');
      setForm(current => ({ ...current, reason: '', usage: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to submit your application.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || user.role !== 'PASSENGER') return null;

  return (
    <div className="page-wrapper max-w-3xl animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">⭐</div>
        <h1 className="section-title">RailAssist Premium Application</h1>
        <p className="section-subtitle max-w-2xl mx-auto mt-2">Tell us which plan fits your travel and why you want Premium. This is an application form for now; payment and activation will follow the review process.</p>
      </div>
      <form onSubmit={submit} className="card space-y-5">
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">{error}</div>}
        {message && <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">{message}</div>}
        <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Premium plan *</label><select className="input-field" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>{PLANS.map(plan => <option key={plan}>{plan}</option>)}</select></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Full name *</label><input required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Email *</label><input required type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Phone *</label><input required className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Expected usage</label><input className="input-field" placeholder="For example, weekly travel" value={form.usage} onChange={e => setForm({ ...form, usage: e.target.value })} /></div>
        </div>
        <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Why do you want Premium? *</label><textarea required minLength={10} rows={5} className="input-field" placeholder="Tell us how Premium would help your railway travel." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
        <div className="flex flex-col sm:flex-row gap-3"><button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Submitting...' : 'Submit Premium application'}</button><button type="button" onClick={() => router.push('/')} className="btn-outline">Back to home</button></div>
      </form>
    </div>
  );
}
