import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { donationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RequestFoodModal from '../components/modals/RequestFoodModal';
import { 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Package, 
  HeartHandshake, 
  AlertCircle, 
  Store, 
  ArrowLeft, 
  Sparkles,
  Info,
  Thermometer,
  ShieldAlert
} from 'lucide-react';

const FoodDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        const res = await donationsAPI.getById(id);
        if (res.data && res.data.donation) {
          setDonation(res.data.donation);
        }
      } catch (err) {
        console.error('Failed to load donation details:', err);
        toast.error('Food donation not found or could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Loading food donation details...</p>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Food Listing Not Found</h2>
        <p className="text-xs text-slate-500">The listing may have been claimed, expired, or deleted.</p>
        <Link
          to="/donations"
          className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Available Food Catalog
        </Link>
      </div>
    );
  }

  const availableQty =
    donation.remainingQuantity !== undefined
      ? donation.remainingQuantity
      : donation.quantity;

  const isExpired = new Date(donation.expiryDate) < new Date();

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in as a food receiver or charity to claim this food donation.');
      navigate('/login', { state: { from: { pathname: `/donations/${id}` } } });
      return;
    }

    if (user?.role !== 'receiver' && user?.role !== 'admin') {
      toast.warning('Only registered receivers / charities can request food donations.');
      return;
    }

    if (availableQty <= 0 || isExpired) {
      toast.error('This food donation is no longer available.');
      return;
    }

    setIsRequestModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          to="/donations"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Food Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Image & Badges */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl aspect-[16/10] bg-slate-100 relative">
            <img
              src={donation.foodImage}
              alt={donation.foodName}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {donation.category.replace('_', ' ')}
              </span>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md ${
                isExpired
                  ? 'bg-red-500/90 text-white'
                  : 'bg-emerald-600/90 text-white'
              }`}>
                {isExpired ? 'Expired' : donation.status.replace('_', ' ')}
              </span>
            </div>

            {/* Quantity Pill */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md text-white p-3.5 rounded-2xl flex items-center justify-between border border-white/10">
              <span className="text-xs font-semibold text-slate-300">Remaining Available:</span>
              <span className="text-base font-black text-emerald-400">
                {availableQty} {donation.unit} (out of {donation.quantity} originally)
              </span>
            </div>
          </div>

          {/* Description & Food Safety */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Food Description & Safety Details</h2>
              <p className="text-xs text-slate-500 mt-1">Inspected and verified under FoodBridge Redistribution Safety Protocol</p>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {donation.description}
            </p>

            {/* Dietary Tags */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dietary Classifications</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {donation.dietaryInfo?.isVegetarian && (
                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                    🌱 Vegetarian
                  </span>
                )}
                {donation.dietaryInfo?.isVegan && (
                  <span className="text-xs bg-green-50 text-green-800 border border-green-200 px-3 py-1 rounded-full font-bold">
                    🥬 Vegan
                  </span>
                )}
                {donation.dietaryInfo?.isHalal && (
                  <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full font-bold">
                    🌙 Halal Certified
                  </span>
                )}
                {donation.dietaryInfo?.isGlutenFree && (
                  <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold">
                    🌾 Gluten-Free
                  </span>
                )}
                {!donation.dietaryInfo?.isVegetarian && !donation.dietaryInfo?.isVegan && !donation.dietaryInfo?.isHalal && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                    Standard Preparation
                  </span>
                )}
              </div>
            </div>

            {/* Storage Guidelines */}
            <div className="pt-4 border-t border-slate-100 flex items-center space-x-3 text-xs text-slate-600">
              <Thermometer className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800">Storage Environment: </span>
                <span className="capitalize">{donation.storageRequirements?.replace('_', ' ') || 'Refrigerated'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Donor Info & Claim Action */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs text-primary-700 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Surplus Meal</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">
                {donation.foodName}
              </h1>
            </div>

            {/* Strict Timelines */}
            <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-start space-x-3 text-xs">
                <Clock className="w-4 h-4 text-primary-700 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Available For Pickup:</span>
                  <p className="text-slate-600">{new Date(donation.pickupDate).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-red-900">Food Safety Expiry:</span>
                  <p className="text-red-700 font-semibold">{new Date(donation.expiryDate).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Pickup Location Details */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-primary-600" />
                <span>Pickup Address</span>
              </div>
              <p className="text-slate-600 pl-5 leading-relaxed font-medium">
                {donation.pickupLocation?.fullAddress}
              </p>
              {donation.pickupLocation?.instructions && (
                <p className="text-[11px] text-slate-500 pl-5 italic">
                  Note: "{donation.pickupLocation.instructions}"
                </p>
              )}
            </div>

            {/* Request Action Button */}
            <div className="pt-4 border-t border-slate-100">
              {isExpired ? (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-bold flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>This listing has passed its expiry threshold and cannot be requested.</span>
                </div>
              ) : availableQty <= 0 ? (
                <div className="p-3 bg-slate-100 text-slate-600 text-xs rounded-xl font-bold text-center">
                  All portions for this listing have been claimed.
                </div>
              ) : (
                <button
                  onClick={handleRequestClick}
                  className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-primary-600/30 transition flex items-center justify-center space-x-2 group"
                >
                  <HeartHandshake className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Request Food For Your Organization</span>
                </button>
              )}
            </div>
          </div>

          {/* Donor Profile Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Food Donor Information</h3>
            <div className="flex items-center space-x-3.5">
              <img
                src={donation.donorId?.profileImage || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80'}
                alt={donation.donorId?.organizationName || donation.donorId?.name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <p className="font-extrabold text-sm text-slate-900">
                  {donation.donorId?.organizationName || donation.donorId?.name}
                </p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[11px] text-slate-500">{donation.donorId?.organizationType || 'Restaurant'}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center text-emerald-600 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 mr-0.5" /> Verified
                  </span>
                </div>
              </div>
            </div>

            {donation.donorId?.bio && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{donation.donorId.bio}"
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Request Modal */}
      <RequestFoodModal
        isOpen={isRequestModalOpen}
        donation={donation}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          setIsRequestModalOpen(false);
          // Refetch to reflect claimed quantity
          donationsAPI.getById(id).then((res) => setDonation(res.data.donation));
        }}
      />
    </div>
  );
};

export default FoodDetailsPage;
