'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosInstance';

export default function BookingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    station: 'New Delhi',
    train_number: '',
    platform: '',
    scheduled_at: '',
    porter: false,
    bags_count: 1,
    wheelchair: false,
    meet_and_greet: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    api.get('/stations')
      .then(res => {
        if (res.data.length > 0) setStations(res.data);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    if (form.porter) total += parseInt(form.bags_count || 1) * 60;
    if (form.wheelchair) total += 150;
    if (form.meet_and_greet) total += 250;
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const services = [];
    if (form.porter) services.push({ type: 'PORTER', bags_count: parseInt(form.bags_count) });
    if (form.wheelchair) services.push({ type: 'WHEELCHAIR' });
    if (form.meet_and_greet) services.push({ type: 'MEET_AND_GREET' });

    if (services.length === 0) {
      setError('Please select at least one service.');
      return;
    }

    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));

      await api.post('/bookings', {
        station: form.station,
        train_number: form.train_number,
        platform: form.platform,
        scheduled_at: form.scheduled_at,
        services
      });
      setSuccess('Booking requested! Our system is assigning the best providers to you.');
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-3">🚂</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🤝 Request Assistance</h1>
          <p className="text-gray-500 dark:text-gray-400">Book porters, wheelchairs, and meet & greet services.</p>
        </div>

        <div className="card p-8 shadow-xl">
          {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6">⚠️ {error}</div>}
          {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-xl mb-6">🎉 {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Station <span className="text-red-400">*</span></label>
                <select name="station" value={form.station} onChange={handleChange} className="input-field w-full">
                  {(stations.length ? stations : ['New Delhi', 'Mumbai CST', 'Bengaluru City']).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Date & Time</label>
                <input type="datetime-local" name="scheduled_at" value={form.scheduled_at} onChange={handleChange} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Train Number</label>
                <input type="text" name="train_number" value={form.train_number} onChange={handleChange} placeholder="e.g. 12951" className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Platform</label>
                <input type="text" name="platform" value={form.platform} onChange={handleChange} placeholder="e.g. 4A" className="input-field w-full" />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Services</h3>
              <div className="space-y-3">
                {/* Porter */}
                <label className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input type="checkbox" name="porter" checked={form.porter} onChange={handleChange} className="mt-1 w-5 h-5 text-[#1a3a6b] dark:text-blue-500 rounded" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">🧳 Porter (Coolie)</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Luggage assistance starting at ₹60/bag</div>
                    {form.porter && (
                      <div className="mt-3 flex items-center space-x-3">
                        <span className="text-sm font-medium dark:text-gray-300">Number of bags:</span>
                        <input type="number" name="bags_count" min="1" max="20" value={form.bags_count} onChange={handleChange} className="input-field w-20 text-center" onClick={e => e.stopPropagation()}/>
                      </div>
                    )}
                  </div>
                </label>

                {/* Wheelchair */}
                <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input type="checkbox" name="wheelchair" checked={form.wheelchair} onChange={handleChange} className="w-5 h-5 text-[#1a3a6b] dark:text-blue-500 rounded" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">♿ Wheelchair Assistance</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Dedicated assistant with wheelchair - ₹150 flat</div>
                  </div>
                </label>

                {/* Meet & Greet */}
                <label className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input type="checkbox" name="meet_and_greet" checked={form.meet_and_greet} onChange={handleChange} className="w-5 h-5 text-[#1a3a6b] dark:text-blue-500 rounded" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">🤝 Meet & Greet</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Guided assistance from drop-off to train seat - ₹250 flat</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl flex items-center justify-between border border-blue-100 dark:border-blue-900/50">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Estimated Total</p>
                <p className="text-3xl font-bold text-[#1a3a6b] dark:text-blue-400">₹{calculateTotal()}</p>
              </div>
              <button type="submit" disabled={loading || success} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-60 text-lg shadow-sm flex items-center space-x-2">
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Processing booking...' : (success ? 'Confirmed!' : 'Confirm Request')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
