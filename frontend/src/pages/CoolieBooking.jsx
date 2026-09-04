import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import CoolieCard from '../components/CoolieCard';

export default function CoolieBooking() {
  const [coolies, setCoolies] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [selectedCoolie, setSelectedCoolie] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    train_number: '', platform: '', bags_count: 1, scheduled_at: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Fetch stations
  useEffect(() => {
    api.get('/stations')
      .then(res => setStations(res.data))
      .catch(() => {});
  }, []);

  // Fetch coolies when station changes
  useEffect(() => {
    setLoading(true);
    setError('');
    const url = selectedStation === 'all'
      ? '/coolies'
      : `/coolies?station=${encodeURIComponent(selectedStation)}`;

    api.get(url)
      .then(res => setCoolies(res.data))
      .catch(() => setError('Failed to load coolies. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [selectedStation]);

  const openBookingModal = (coolie) => {
    setSelectedCoolie(coolie);
    setBookingForm({ train_number: '', platform: '', bags_count: 1, scheduled_at: '' });
    setBookingError('');
    setBookingSuccess('');
  };

  const closeModal = () => {
    setSelectedCoolie(null);
    setBookingSuccess('');
    setBookingError('');
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');
    try {
      await api.post('/bookings', {
        coolie_id: selectedCoolie.id,
        station: selectedCoolie.station,
        train_number: bookingForm.train_number,
        platform: bookingForm.platform,
        bags_count: parseInt(bookingForm.bags_count),
        scheduled_at: bookingForm.scheduled_at || null,
      });
      setBookingSuccess(`🎉 Booking confirmed! ${selectedCoolie.name} will assist you at ${selectedCoolie.station}.`);
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const totalPrice = selectedCoolie
    ? selectedCoolie.price_per_bag * parseInt(bookingForm.bags_count || 1)
    : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧳 Book a Coolie</h1>
          <p className="text-gray-500">Browse verified railway porters at major stations across India</p>
        </div>

        {/* Station Filter */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter by Station</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStation('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStation === 'all'
                  ? 'bg-[#1a3a6b] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🗺️ All Stations
            </button>
            {stations.map(station => (
              <button
                key={station}
                onClick={() => setSelectedStation(station)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedStation === station
                    ? 'bg-[#1a3a6b] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {station}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && !error && (
          <div className="mb-4 text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{coolies.length}</span> coolie{coolies.length !== 1 ? 's' : ''}
            {selectedStation !== 'all' && <> at <span className="font-semibold text-[#1a3a6b]">{selectedStation}</span></>}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-5xl animate-bounce mb-4">🚂</div>
            <p className="text-gray-400 text-lg">Loading coolies...</p>
          </div>
        ) : coolies.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No coolies available</h3>
            <p className="text-gray-500">Try a different station or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coolies.map(coolie => (
              <div key={coolie.id} className="relative">
                <CoolieCard coolie={coolie} onBook={openBookingModal} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {selectedCoolie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1a3a6b] to-[#2563eb] text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Book {selectedCoolie.name}</h2>
                <p className="text-blue-200 text-sm">{selectedCoolie.station} · Badge: {selectedCoolie.badge_number}</p>
              </div>
              <button onClick={closeModal} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm mb-6">
                    {bookingSuccess}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-[#1a3a6b] hover:bg-[#14305a] text-white font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      Close
                    </button>
                    <a href="/dashboard" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-center">
                      View Bookings
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {bookingError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      ⚠️ {bookingError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Train Number</label>
                      <input
                        type="text"
                        name="train_number"
                        value={bookingForm.train_number}
                        onChange={handleBookingChange}
                        placeholder="e.g. 12951"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Platform No.</label>
                      <input
                        type="text"
                        name="platform"
                        value={bookingForm.platform}
                        onChange={handleBookingChange}
                        placeholder="e.g. 4A"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Number of Bags <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="bags_count"
                      value={bookingForm.bags_count}
                      onChange={handleBookingChange}
                      min={1}
                      max={20}
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Scheduled Date & Time</label>
                    <input
                      type="datetime-local"
                      name="scheduled_at"
                      value={bookingForm.scheduled_at}
                      onChange={handleBookingChange}
                      className="input-field"
                    />
                  </div>

                  {/* Price summary */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Rate per bag</span>
                      <span>₹{selectedCoolie.price_per_bag}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Number of bags</span>
                      <span>{bookingForm.bags_count}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-gray-900">
                      <span>Total Amount</span>
                      <span className="text-[#1a3a6b] text-xl">₹{totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {bookingLoading ? '⏳ Confirming...' : '✅ Confirm Booking'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
