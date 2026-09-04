import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import BookingCard from '../components/BookingCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelMsg, setCancelMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setCancelMsg('Booking cancelled successfully!');
      fetchBookings();
      setTimeout(() => setCancelMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');
  const totalSpent = confirmed.reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1a3a6b] to-[#2563eb] text-white rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-[10rem] leading-none">🚂</div>
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-blue-200">Here's a summary of your railway activity.</p>

          <div className="mt-6 flex space-x-4">
            <Link
              to="/coolies"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              🧳 Book a Coolie
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {cancelMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center space-x-2">
            <span>✅</span><span>{cancelMsg}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center space-x-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Bookings',   value: bookings.length,  icon: '📋', color: 'text-blue-600',  bg: 'bg-blue-50' },
            { label: 'Active Bookings',  value: confirmed.length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Cancelled',        value: cancelled.length, icon: '❌', color: 'text-red-600',   bg: 'bg-red-50' },
            { label: 'Total Spent',      value: `₹${totalSpent}`, icon: '💰', color: 'text-orange-600',bg: 'bg-orange-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">👤 My Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Full Name</p>
              <p className="font-semibold text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Phone</p>
              <p className="font-semibold text-gray-900">{user?.phone || '—'}</p>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">🧳 My Bookings</h2>
            <Link to="/coolies" className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
              + New Booking
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="text-4xl animate-bounce mb-3">🚂</div>
              <p className="text-gray-400">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
              <div className="text-6xl mb-4">🧳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-6">Book your first coolie for your upcoming journey!</p>
              <Link to="/coolies" className="btn-primary">
                Browse Coolies
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
