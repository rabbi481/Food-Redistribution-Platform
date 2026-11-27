import React, { useState } from 'react';
import { requestsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, Send, Truck, Store, AlertCircle, Info } from 'lucide-react';

const RequestFoodModal = ({ isOpen, onClose, donation, onSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const availableQty = donation
    ? donation.remainingQuantity !== undefined
      ? donation.remainingQuantity
      : donation.quantity
    : 0;

  const [requestedQuantity, setRequestedQuantity] = useState(
    Math.min(10, availableQty || 1)
  );
  const [deliveryMethod, setDeliveryMethod] = useState('volunteer_delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.address?.formattedAddress || user?.address?.street || ''
  );
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState('');

  if (!isOpen || !donation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(requestedQuantity) > availableQty) {
      toast.error(`Cannot request more than available quantity (${availableQty} ${donation.unit})`);
      return;
    }

    if (Number(requestedQuantity) <= 0) {
      toast.error('Please request at least 1 unit');
      return;
    }

    if (!message.trim()) {
      toast.error('Please provide a message explaining your organization or community need');
      return;
    }

    if (deliveryMethod === 'volunteer_delivery' && !deliveryAddress.trim()) {
      toast.error('Please specify a delivery address for volunteer pickup & drop-off');
      return;
    }

    try {
      setLoading(true);
      await requestsAPI.create({
        donationId: donation._id,
        requestedQuantity: Number(requestedQuantity),
        message,
        deliveryMethod,
        deliveryAddress,
        contactPhone,
      });

      toast.success('Food donation request submitted successfully! Awaiting donor review.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit food request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-scaleIn">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Request Available Food</h2>
            <p className="text-xs text-slate-500">Submit your request to the food donor</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Food Preview Summary */}
        <div className="px-6 py-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center space-x-4">
          <img
            src={donation.foodImage}
            alt={donation.foodName}
            className="w-16 h-16 rounded-xl object-cover border border-emerald-200 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">{donation.foodName}</h4>
            <p className="text-xs text-slate-600 truncate">
              Donor: {donation.donorId?.organizationName || donation.donorId?.name}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {availableQty} {donation.unit} available
              </span>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Quantity Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Requested Quantity *</label>
              <span className="text-xs text-slate-500">Max: {availableQty} {donation.unit}</span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max={availableQty}
                required
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm font-bold"
              />
              <span className="text-sm font-bold text-slate-600 px-3 py-2 bg-slate-100 rounded-xl border border-slate-200">
                {donation.unit}
              </span>
            </div>
          </div>

          {/* Delivery Method Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Delivery Preference</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('volunteer_delivery')}
                className={`p-3 rounded-xl border text-left transition flex items-start space-x-2.5 ${
                  deliveryMethod === 'volunteer_delivery'
                    ? 'border-primary-600 bg-primary-50/60 ring-2 ring-primary-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Truck className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Volunteer Delivery</p>
                  <p className="text-[10px] text-slate-500 leading-tight">Couriers deliver to you</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('receiver_pickup')}
                className={`p-3 rounded-xl border text-left transition flex items-start space-x-2.5 ${
                  deliveryMethod === 'receiver_pickup'
                    ? 'border-primary-600 bg-primary-50/60 ring-2 ring-primary-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Store className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Self Pickup</p>
                  <p className="text-[10px] text-slate-500 leading-tight">You collect directly</p>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Address if volunteer delivery */}
          {deliveryMethod === 'volunteer_delivery' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Delivery Address *</label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Where should the volunteer courier deliver the food?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          )}

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Contact Phone Number *</label>
            <input
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Active phone number for delivery coordination"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Message / Beneficiary details */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Message to Donor *</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain how this food will help your beneficiaries (e.g. evening meal for 25 shelter residents)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-md shadow-primary-600/20 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Food Request</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default RequestFoodModal;
