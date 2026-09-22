'use client';

export default function BookingCard({ booking, onCancel }) {
  const statusStyles = {
    REQUESTED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    SEARCHING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    ASSIGNED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    PARTIALLY_ASSIGNED: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    ACCEPTED: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
    ARRIVED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
    STARTED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
    IN_PROGRESS: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
    COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
    REJECTED_OR_CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
  };

  const statusIcons = {
    REQUESTED: '⏳',
    SEARCHING: '🔎',
    ASSIGNED: '🔄',
    PARTIALLY_ASSIGNED: '🔄',
    ACCEPTED: '✅',
    ARRIVED: '📍',
    STARTED: '🏃',
    IN_PROGRESS: '🏃',
    COMPLETED: '🏁',
    CANCELLED: '❌',
    REJECTED_OR_CANCELLED: '❌',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const canCancel = ['REQUESTED', 'SEARCHING', 'ASSIGNED', 'PARTIALLY_ASSIGNED', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status)
    && typeof onCancel === 'function';
  const searching = ['REQUESTED', 'SEARCHING'].includes(booking.status);

  return (
    <div className="card shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Booking #{booking.id}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">📍 {booking.station}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusStyles[booking.status] || statusStyles.REQUESTED}`}>
          {statusIcons[booking.status]} {booking.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        {booking.train_number && (
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <span>🚂</span><span>Train {booking.train_number}</span>
          </div>
        )}
        {booking.platform && (
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <span>🚉</span><span>Platform {booking.platform}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 col-span-2">
          <span>🗓️</span><span>{formatDate(booking.created_at)}</span>
        </div>
      </div>

      <div className="mb-4">
        {searching && (
          <div className="mb-4 overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-blue-900/20">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl shadow-lg shadow-blue-500/30">
                <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-60" />
                🧳
              </div>
              <div className="min-w-0">
                <p className="font-bold text-blue-900 dark:text-blue-200">Finding a porter near you<span className="inline-block w-5 text-left animate-pulse">…</span></p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Your request is being sent instantly to available porters at {booking.station}.</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-950">
              <div className="h-full w-1/2 rounded-full bg-blue-600 animate-[slide_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        )}
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requested Services</h4>
        <div className="space-y-2">
          {booking.services.map((srv, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-sm flex justify-between items-center border border-gray-100 dark:border-gray-700">
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{srv.type}</span>
                {srv.bags_count && <span className="text-gray-500 dark:text-gray-400 ml-1">({srv.bags_count} bags)</span>}
                {srv.provider_name ? (
                  <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-2 text-xs dark:border-green-800 dark:bg-green-900/20">
                    <div className="font-bold text-green-800 dark:text-green-300">✅ Porter found</div>
                    <div className="mt-1 text-gray-700 dark:text-gray-200">Name: {srv.provider_name}</div>
                    <div className="text-gray-600 dark:text-gray-300">Provider ID: {srv.provider_id}</div>
                    {srv.provider_phone && <div className="text-gray-600 dark:text-gray-300">Contact: {srv.provider_phone}</div>}
                    {srv.provider_rating != null && <div className="text-gray-600 dark:text-gray-300">Rating: ⭐ {srv.provider_rating}</div>}
                    {booking.otp_code && <div className="mt-2 font-bold tracking-widest text-blue-700 dark:text-blue-300">Start OTP: {booking.otp_code}</div>}
                  </div>
                ) : (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-0.5">Finding provider...</div>
                )}
              </div>
              <div className="text-right">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusStyles[srv.status]}`}>{srv.status}</span>
                <div className="font-bold text-gray-900 dark:text-white mt-1">₹{srv.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-[#1a3a6b] dark:text-blue-400">₹{booking.total_price}</span>
          <span className="text-gray-400 text-xs ml-1">total</span>
        </div>
        {canCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600"
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}
