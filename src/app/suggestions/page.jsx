'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';

const categories = ['General', 'Booking', 'Employee Portal', 'Station Experience', 'Safety', 'Other'];

export default function SuggestionsPage() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ category: 'General', title: '', description: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-12 text-gray-500">Loading...</div>;
  if (!user) return <div className="mx-auto max-w-2xl px-4 py-12 text-gray-500">Please sign in to suggest a change.</div>;
  const canSubmit = ['PASSENGER', 'PROVIDER'].includes(user.role);

  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/suggestions', form);
      setForm({ category: 'General', title: '', description: '' });
      setMessage({ type: 'success', text: 'Your suggestion was submitted for review.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Unable to submit suggestion.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💡 Suggest Changes</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Help us improve RailAssist. Suggestions are reviewed by the complaint manager and admin team.</p>
        {!canSubmit ? (
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">Your role can review suggestions from the dashboard.</div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-5">
            {message.text && <div className={`rounded-lg border p-3 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{message.text}</div>}
            <div>
              <label className="mb-1 block text-sm font-semibold dark:text-gray-200">Category</label>
              <select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} className="input-field w-full">
                {categories.map(category => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold dark:text-gray-200">Short title *</label>
              <input required maxLength={120} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="input-field w-full" placeholder="What should we improve?" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold dark:text-gray-200">Suggestion details *</label>
              <textarea required maxLength={3000} rows={6} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="input-field w-full resize-y" placeholder="Explain the current problem and your proposed change." />
            </div>
            <button disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Submitting...' : 'Submit Suggestion'}</button>
          </form>
        )}
      </div>
    </section>
  );
}
