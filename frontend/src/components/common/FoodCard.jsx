import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Calendar, CheckCircle, AlertTriangle, ShieldCheck, Heart } from 'lucide-react';

const FoodCard = ({ donation, onRequestClick, showAction = true }) => {
  const availableQty =
    donation.remainingQuantity !== undefined
      ? donation.remainingQuantity
      : donation.quantity;

  // Format expiry time calculation
  const getExpiryLabel = (dateStr) => {
    const diffMs = new Date(dateStr) - new Date();
    if (diffMs <= 0) return { text: 'Expired', isUrgent: true };
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 6) return { text: `Expires in ${diffHours}h`, isUrgent: true };
    if (diffHours < 24) return { text: `Expires in ${diffHours}h`, isUrgent: false };
    const diffDays = Math.floor(diffHours / 24);
    return { text: `Expires in ${diffDays}d`, isUrgent: false };
  };

  const expiry = getExpiryLabel(donation.expiryDate);

  const getCategoryBadge = (cat) => {
    const map = {
      cooked_meals: { label: 'Cooked Meal', color: 'bg-emerald-100 text-emerald-800' },
      bakery: { label: 'Bakery', color: 'bg-amber-100 text-amber-800' },
      produce: { label: 'Fresh Produce', color: 'bg-green-100 text-green-800' },
      dairy: { label: 'Dairy', color: 'bg-blue-100 text-blue-800' },
      canned_packaged: { label: 'Packaged', color: 'bg-purple-100 text-purple-800' },
      raw_ingredients: { label: 'Ingredients', color: 'bg-teal-100 text-teal-800' },
      beverages: { label: 'Beverages', color: 'bg-cyan-100 text-cyan-800' },
      other: { label: 'General', color: 'bg-slate-100 text-slate-800' },
    };
    return map[cat] || { label: cat, color: 'bg-slate-100 text-slate-800' };
  };

  const category = getCategoryBadge(donation.category);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={donation.foodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
          alt={donation.foodName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${category.color}`}>
            {category.label}
          </span>
        </div>

        {/* Expiry Pill */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-md ${
              expiry.isUrgent
                ? 'bg-red-500/90 text-white'
                : 'bg-slate-900/80 text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            {expiry.text}
          </span>
        </div>

        {/* Available quantity banner on image bottom */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent p-3 pt-6 flex justify-between items-end">
          <span className="text-white text-xs font-semibold">Available Quantity</span>
          <span className="text-white text-sm font-extrabold bg-primary-600/90 px-2 py-0.5 rounded-lg shadow">
            {availableQty} {donation.unit}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Donor details */}
          <div className="flex items-center space-x-2 mb-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 truncate">
              {donation.donorId?.organizationName || donation.donorId?.name || 'Verified Food Donor'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center text-emerald-600 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 mr-0.5" /> Verified
            </span>
          </div>

          {/* Title */}
          <Link to={`/donations/${donation._id}`}>
            <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1 hover:text-primary-600 transition">
              {donation.foodName}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {donation.description}
          </p>

          {/* Dietary tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {donation.dietaryInfo?.isVegetarian && (
              <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-md font-semibold">
                Vegetarian
              </span>
            )}
            {donation.dietaryInfo?.isHalal && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                Halal
              </span>
            )}
            {donation.dietaryInfo?.isGlutenFree && (
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                Gluten-Free
              </span>
            )}
          </div>
        </div>

        {/* Location & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500 truncate max-w-[55%]">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {donation.pickupLocation?.city || donation.pickupLocation?.fullAddress?.split(',')[1] || 'Downtown SF'}
            </span>
          </div>

          {showAction && (
            <div className="flex items-center space-x-2">
              <Link
                to={`/donations/${donation._id}`}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              >
                Details
              </Link>
              {onRequestClick && (
                <button
                  onClick={() => onRequestClick(donation)}
                  className="text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition"
                >
                  Request
                </button>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default FoodCard;
