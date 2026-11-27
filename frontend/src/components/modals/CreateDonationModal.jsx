import React, { useState } from 'react';
import { donationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Upload, Calendar, Clock, MapPin, AlertCircle, Sparkles, Check } from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Cooked Meals', url: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fresh Bakery', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fresh Produce', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dairy & Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hot Soup', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Canned Goods', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80' },
];

const CreateDonationModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Default dates: pickup in 2 hours, expiry in 24 hours
  const formatDatetime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const now = new Date();
  const defaultPickup = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const defaultExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [formData, setFormData] = useState({
    foodName: '',
    category: 'cooked_meals',
    description: '',
    quantity: 20,
    unit: 'servings',
    foodImage: PRESET_IMAGES[0].url,
    pickupLocation: {
      fullAddress: '',
      instructions: '',
    },
    pickupDate: formatDatetime(defaultPickup),
    expiryDate: formatDatetime(defaultExpiry),
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      isGlutenFree: false,
      containsAllergens: false,
    },
    storageRequirements: 'refrigerated',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      pickupLocation: { ...prev.pickupLocation, [name]: value },
    }));
  };

  const handleDietaryToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      dietaryInfo: { ...prev.dietaryInfo, [key]: !prev.dietaryInfo[key] },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodName.trim() || !formData.description.trim()) {
      toast.error('Please enter food name and description');
      return;
    }

    if (!formData.pickupLocation.fullAddress.trim()) {
      toast.error('Please provide a full pickup address');
      return;
    }

    if (new Date(formData.expiryDate) <= new Date()) {
      toast.error('Expiry date must be in the future. Food safety rules prohibit expired food.');
      return;
    }

    try {
      setLoading(true);
      await donationsAPI.create(formData);
      toast.success('Food donation listing created successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create food donation listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">List Surplus Food Donation</h2>
            <p className="text-xs text-slate-500">Provide accurate food details to protect recipients and reduce waste</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Food Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Food Item Name *</label>
              <input
                type="text"
                name="foodName"
                required
                value={formData.foodName}
                onChange={handleChange}
                placeholder="e.g., Fresh Vegetable Pasta Trays"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              >
                <option value="cooked_meals">Cooked Meals</option>
                <option value="bakery">Fresh Bakery</option>
                <option value="produce">Fresh Produce</option>
                <option value="dairy">Dairy Products</option>
                <option value="canned_packaged">Canned / Packaged</option>
                <option value="raw_ingredients">Raw Ingredients</option>
                <option value="beverages">Beverages</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Description & Preparation Info *</label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the items, ingredients, portions, and how it was prepared..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Total Quantity *</label>
              <input
                type="number"
                name="quantity"
                min="1"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Unit of Measurement *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              >
                <option value="servings">Servings / Portions</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="boxes">Boxes / Crates</option>
                <option value="packets">Packets / Units</option>
                <option value="liters">Liters</option>
                <option value="items">Individual Items</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Storage Environment</label>
              <select
                name="storageRequirements"
                value={formData.storageRequirements}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              >
                <option value="room_temperature">Room Temperature</option>
                <option value="refrigerated">Refrigerated (Cold)</option>
                <option value="frozen">Frozen</option>
                <option value="hot_holding">Hot Holding</option>
              </select>
            </div>
          </div>

          {/* Pickup and Expiry Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary-600" />
                Pickup Date & Time *
              </label>
              <input
                type="datetime-local"
                name="pickupDate"
                required
                value={formData.pickupDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                Strict Expiry Date & Time *
              </label>
              <input
                type="datetime-local"
                name="expiryDate"
                required
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              />
            </div>
          </div>

          {/* Pickup Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary-600" />
              Pickup Location Address *
            </label>
            <input
              type="text"
              name="fullAddress"
              required
              value={formData.pickupLocation.fullAddress}
              onChange={handleLocationChange}
              placeholder="e.g., 452 Pine Street, Downtown, San Francisco, CA"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <input
              type="text"
              name="instructions"
              value={formData.pickupLocation.instructions}
              onChange={handleLocationChange}
              placeholder="Pickup notes (e.g., ring back door bell, ask for kitchen manager)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-600"
            />
          </div>

          {/* Dietary Checkboxes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Dietary & Safety Badges</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { key: 'isVegetarian', label: 'Vegetarian' },
                { key: 'isVegan', label: 'Vegan' },
                { key: 'isHalal', label: 'Halal Certified' },
                { key: 'isGlutenFree', label: 'Gluten-Free' },
              ].map((badge) => (
                <button
                  type="button"
                  key={badge.key}
                  onClick={() => handleDietaryToggle(badge.key)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition ${
                    formData.dietaryInfo[badge.key]
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {badge.label}
                </button>
              ))}
            </div>
          </div>

          {/* Food Photo / Image URL & Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Food Photo (Select Preset or Enter URL)</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setFormData((p) => ({ ...p, foodImage: preset.url }))}
                  className={`relative rounded-xl overflow-hidden border-2 transition aspect-video group ${
                    formData.foodImage === preset.url ? 'border-primary-600 ring-2 ring-primary-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white text-[9px] py-0.5 truncate text-center">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="url"
              name="foodImage"
              value={formData.foodImage}
              onChange={handleChange}
              placeholder="Or paste an image URL..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-600"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-md shadow-primary-600/20 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Listing Food...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Donation</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateDonationModal;
