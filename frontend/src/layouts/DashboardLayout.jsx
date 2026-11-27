import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Utensils, 
  LayoutDashboard, 
  PlusCircle, 
  Inbox, 
  Truck, 
  Users, 
  ClipboardList, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  Package,
  HeartHandshake,
  CheckCircle,
  Home
} from 'lucide-react';

const DashboardLayout = ({ children, title, subtitle, activeTab, onTabChange, onOpenCreateModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const role = user?.role || 'donor';

  // Define sidebar navigation items based on current role
  const getNavItems = () => {
    switch (role) {
      case 'donor':
        return [
          { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'donations', label: 'My Food Listings', icon: Package },
          { id: 'requests', label: 'Incoming Requests', icon: Inbox },
        ];
      case 'receiver':
        return [
          { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'browse', label: 'Browse Food Catalog', icon: Utensils },
          { id: 'my-requests', label: 'My Food Requests', icon: ClipboardList },
        ];
      case 'volunteer':
        return [
          { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'available', label: 'Available Delivery Tasks', icon: Truck },
          { id: 'active', label: 'My Active Deliveries', icon: CheckCircle },
        ];
      case 'admin':
        return [
          { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
          { id: 'users', label: 'Manage Users', icon: Users },
          { id: 'listings', label: 'Manage Food Listings', icon: Package },
          { id: 'requests', label: 'Manage Requests', icon: ClipboardList },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900">Food<span className="text-primary-600">Bridge</span></span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
            {role}
          </span>
        </div>
      </div>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white">Food<span className="text-primary-400">Bridge</span></span>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center space-x-3">
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.organizationName || user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-primary-900/60 text-primary-300 border border-primary-700/50">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action (for Donor) */}
        {role === 'donor' && onOpenCreateModal && (
          <div className="px-4 mb-2">
            <button
              onClick={onOpenCreateModal}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-sm shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Food Donation</span>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onTabChange) onTabChange(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </button>
            );
          })}

          <div className="pt-6">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Navigation</p>
            <Link
              to="/"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Back to Home</span>
            </Link>
            <Link
              to="/donations"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <Utensils className="w-4 h-4 text-slate-400" />
              <span>Public Food Listings</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-5 hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center space-x-4">
            {role === 'donor' && onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center space-x-2 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-600/20 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Food</span>
              </button>
            )}

            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              <img
                src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
