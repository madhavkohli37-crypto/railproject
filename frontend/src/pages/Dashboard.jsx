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

  const activeStatuses = ['REQUESTED', 'ASSIGNED', 'PARTIALLY_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'];
  const activeBookings = bookings.filter(b => activeStatuses.includes(b.status));
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED_OR_CANCELLED');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_price, 0);

  const SkeletonBooking = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse h-48">
      <div className="flex justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-1/4 mt-4"></div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 animate-fade-in transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1a3a6b] to-[#2563eb] dark:from-[#0f2347] dark:to-[#1a3a6b] text-white rounded-2xl p-8 mb-8 relative overflow-hidden transition-all duration-300">
          <div className="absolute right-0 top-0 opacity-10 text-[10rem] leading-none">🚂</div>
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-blue-200">Here's a summary of your railway activity.</p>

          <div className="mt-6 flex space-x-4">
            <Link
              to="/book"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-transform active:scale-95 text-sm shadow-sm hover:shadow-md"
            >
              🧳 Request Assistance
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {cancelMsg && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center space-x-2 animate-fade-in">
            <span>✅</span><span>{cancelMsg}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center space-x-2 animate-fade-in">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Bookings',   value: bookings.length,  icon: '📋', color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-900/30' },
            { label: 'Active Bookings',  value: activeBookings.length, icon: '✅', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
            { label: 'Cancelled',        value: cancelledBookings.length, icon: '❌', color: 'text-red-600 dark:text-red-400',   bg: 'bg-red-50 dark:bg-red-900/30' },
            { label: 'Total Spent',      value: `₹${totalSpent}`, icon: '💰', color: 'text-orange-600 dark:text-orange-400',bg: 'bg-orange-50 dark:bg-orange-900/30' },
          ].map((stat) => (
            <div key={stat.label} className="card transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {loading ? <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div> : stat.value}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="card mb-8 transition-all hover:shadow-md">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👤 My Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Phone</p>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.phone || '—'}</p>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧳 My Bookings</h2>
            <Link to="/book" className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors">
              + New Request
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map(i => <SkeletonBooking key={i} />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="card text-center animate-fade-in py-16">
              <div className="text-6xl mb-4">🧳</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No booking requests yet.</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Book your first provider for your upcoming journey!</p>
              <Link to="/book" className="btn-primary inline-block">
                Request Assistance
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
