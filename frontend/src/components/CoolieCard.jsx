export default function CoolieCard({ coolie, onBook }) {
  const stars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  const avatarColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500',
  ];
  const colorIndex = coolie.id % avatarColors.length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a6b] to-[#2563eb] p-4 text-white">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full ${avatarColors[colorIndex]} flex items-center justify-center text-xl font-bold border-2 border-white/30`}>
            {coolie.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg">{coolie.name}</h3>
            <p className="text-blue-200 text-sm">Badge: {coolie.badge_number}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center text-gray-600 text-sm">
          <span className="mr-2">📍</span>
          <span className="font-medium">{coolie.station}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500 text-sm">{stars(coolie.rating)}</span>
            <span className="text-gray-600 text-sm ml-1">({coolie.rating.toFixed(1)})</span>
          </div>
          <div className="flex items-center text-gray-500 text-xs">
            <span>🎯 {coolie.experience_years} yrs exp</span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 text-sm">
          <span className="mr-2">📞</span>
          <span>{coolie.phone}</span>
        </div>

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-[#1a3a6b]">₹{coolie.price_per_bag}</span>
            <span className="text-gray-500 text-xs ml-1">/ bag</span>
          </div>
          <button
            onClick={() => onBook(coolie)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Available badge */}
      <div className="absolute top-3 right-3">
        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          Available
        </span>
      </div>
    </div>
  );
}
