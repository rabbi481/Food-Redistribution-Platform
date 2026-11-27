import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Utensils, 
  Store, 
  Heart, 
  Truck, 
  Check, 
  ArrowRight, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  MapPin, 
  Building 
} from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('donor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    organizationName: '',
    organizationType: 'Restaurant',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const user = await register({
        ...formData,
        role,
      });

      toast.success(`Welcome to FoodBridge, ${user.name}!`);
      navigate(`/dashboard/${user.role}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8 bg-surface flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-600/30">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">Food<span className="text-primary-600">Bridge</span></span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
          <p className="text-xs text-slate-500">Choose your role to get started</p>
        </div>

        {/* Role Selector Cards */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-2 ${
              role === 'donor'
                ? 'border-primary-600 bg-primary-50/60 ring-2 ring-primary-500'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              role === 'donor' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Food Donor</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Restaurants & Stores</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole('receiver')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-2 ${
              role === 'receiver'
                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              role === 'receiver' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Food Receiver</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">NGOs & Shelters</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole('volunteer')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-2 ${
              role === 'volunteer'
                ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              role === 'volunteer' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Volunteer</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Pickup & Delivery</p>
            </div>
          </button>
        </div>

        {/* Registration Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Alex Johnson"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Password (min 6 chars) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Organization Fields for Donor & Receiver */}
            {(role === 'donor' || role === 'receiver') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Organization Name *</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder={role === 'donor' ? 'e.g. Fresh Bites Bistro' : 'e.g. Hope Community Shelter'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Organization Type</label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                  >
                    {role === 'donor' ? (
                      <>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Supermarket">Supermarket</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Event Organizer">Event Organizer</option>
                        <option value="Individual">Individual Donor</option>
                      </>
                    ) : (
                      <>
                        <option value="NGO">NGO / Charity</option>
                        <option value="Shelter">Homeless / Family Shelter</option>
                        <option value="Community Center">Community Kitchen</option>
                        <option value="Individual">Individual in Need</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Location / Address *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, City, State or Postal Code"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-md shadow-primary-600/25 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Already registered on FoodBridge?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
