export default function BookingCard({ booking, onCancel }) {
  const statusStyles = {
    confirmed: 'bg-green-100 text-green-700 border border-green-200',
    cancelled: 'bg-red-100 text-red-700 border border-red-200',
    completed: 'bg-blue-100 text-blue-700 border border-blue-200',
    pending:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
  };

  const statusIcons = {
    confirmed: '✅',
    cancelled: '❌',
    completed: '🏁',
    pending:   '⏳',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{booking.coolie_name}</h3>
          <p className="text-gray-500 text-sm">Badge: {booking.badge_number}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusStyles[booking.status] || statusStyles.pending}`}>
          {statusIcons[booking.status]} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <span>📍</span><span>{booking.station}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <span>🧳</span><span>{booking.bags_count} bag{booking.bags_count > 1 ? 's' : ''}</span>
        </div>
        {booking.train_number && (
          <div className="flex items-center space-x-2 text-gray-600">
            <span>🚂</span><span>Train {booking.train_number}</span>
          </div>
        )}
        {booking.platform && (
          <div className="flex items-center space-x-2 text-gray-600">
            <span>🚉</span><span>Platform {booking.platform}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 text-gray-600">
          <span>📞</span><span>{booking.coolie_phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <span>🗓️</span><span>{formatDate(booking.created_at)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-[#1a3a6b]">₹{booking.total_price}</span>
          <span className="text-gray-400 text-xs ml-1">total</span>
        </div>
        {booking.status === 'confirmed' && (
          <button
            onClick={() => onCancel(booking.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-red-200 hover:border-red-400"
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}
