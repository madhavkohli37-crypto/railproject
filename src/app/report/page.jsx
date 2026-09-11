'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';

const CATEGORIES = [
  'Spitting or littering',
  'Smoking or substance use',
  'Harassment or abusive behaviour',
  'Blocking seats, aisles, or platforms',
  'Other uncivilised activity',
];

export default function ReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ category: CATEGORIES[0], description: '', station: 'New Delhi', train_number: '', platform: '', occurred_at: '' });
  const [images, setImages] = useState([]);
  const [stations, setStations] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'PASSENGER')) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    api.get('/stations').then(res => setStations(res.data)).catch(() => {});
  }, []);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 5) {
      setError('Please attach no more than 5 images.');
      return;
    }
    try {
      const encoded = await Promise.all(files.map(file => new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/') || file.size > 1_500_000) {
          reject(new Error('Images must be JPG, PNG, or another image format smaller than 1.5 MB.'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
        reader.onerror = () => reject(new Error('Unable to read one of the selected images.'));
        reader.readAsDataURL(file);
      })));
      setImages(encoded);
      setError('');
    } catch (err) {
      setError(err.message);
      setImages([]);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/complaints', { ...form, images });
      setSuccess('Your complaint has been registered and sent to the review team.');
      setForm({ category: CATEGORIES[0], description: '', station: 'New Delhi', train_number: '', platform: '', occurred_at: '' });
      setImages([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to submit complaint.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user || user.role !== 'PASSENGER') return null;

  return (
    <div className="page-wrapper max-w-3xl animate-fade-in">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">📣</div>
        <h1 className="text-3xl font-bold dark:text-white">Report an Uncivilised Activity</h1>
        <p className="section-subtitle max-w-xl mx-auto mt-2">Help keep trains and platforms safe, clean, and comfortable. Do not confront anyone or put yourself at risk.</p>
      </div>
      <form onSubmit={submit} className="card space-y-6">
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">{error}</div>}
        {success && <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">{success}</div>}
        <div>
          <label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Activity category</label>
          <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(category => <option key={category}>{category}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Station or location *</label><select required className="input-field" value={form.station} onChange={e => setForm({ ...form, station: e.target.value })}>{(stations.length ? stations : ['New Delhi', 'Mumbai CST', 'Bengaluru City']).map(station => <option key={station}>{station}</option>)}</select></div>
          <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Date and time</label><input className="input-field" type="datetime-local" value={form.occurred_at} onChange={e => setForm({ ...form, occurred_at: e.target.value })} /></div>
          <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Train number</label><input className="input-field" value={form.train_number} onChange={e => setForm({ ...form, train_number: e.target.value })} placeholder="If applicable" /></div>
          <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Platform / coach</label><input className="input-field" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} placeholder="If applicable" /></div>
        </div>
        <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">What happened? *</label><textarea required minLength={10} rows={5} className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe only what you observed, including useful identifying details." /></div>
        <div><label className="block text-sm font-semibold mb-1.5 dark:text-gray-300">Images of the scene</label><input type="file" accept="image/*" multiple onChange={handleFiles} className="block w-full text-sm dark:text-gray-300" /><p className="text-xs text-gray-500 mt-1">Up to 5 images, each smaller than 1.5 MB. Avoid photographing private documents or putting yourself in danger.</p>{images.length > 0 && <p className="text-sm text-green-600 mt-2">{images.length} image(s) ready to upload.</p>}</div>
        <button disabled={saving} className="btn-primary w-full py-3">{saving ? 'Submitting...' : '📣 Register Complaint'}</button>
      </form>
    </div>
  );
}
