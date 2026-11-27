import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Utensils, Lock, Mail, ArrowRight, ShieldCheck, Heart, Truck, Store, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(`/dashboard/${user.role}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login
  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      setLoading(true);
      const user = await login(demoEmail, demoPassword);
      toast.success(`Logged in as demo ${user.role}: ${user.name}`);
      navigate(`/dashboard/${user.role}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-600/30">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">Food<span className="text-primary-600">Bridge</span></span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-500">Access your food redistribution portal</p>
        </div>

        {/* 1-Click Demo Test Accounts Bar */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              1-Click Demo Quick Login:
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-200/60 px-2 py-0.5 rounded-full">
              Testing Ready
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('donor@foodbridge.org', 'Password123!')}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-100/60 text-slate-800 rounded-lg border border-emerald-200 font-semibold text-left transition flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Donor (Bistro)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('receiver@foodbridge.org', 'Password123!')}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-100/60 text-slate-800 rounded-lg border border-emerald-200 font-semibold text-left transition flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Receiver (NGO)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('volunteer@foodbridge.org', 'Password123!')}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-100/60 text-slate-800 rounded-lg border border-emerald-200 font-semibold text-left transition flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="truncate">Volunteer</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin@foodbridge.org', 'Password123!')}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-100/60 text-slate-800 rounded-lg border border-emerald-200 font-semibold text-left transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
              <span className="truncate">Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-md shadow-primary-600/25 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
