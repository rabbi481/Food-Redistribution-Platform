import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { usersAPI, donationsAPI, requestsAPI, dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Users, 
  Package, 
  ClipboardList, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Trash2, 
  Search, 
  Filter, 
  AlertTriangle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    users: { total: 0, donors: 0, receivers: 0, volunteers: 0 },
    donations: { total: 0, active: 0, completed: 0, totalQuantity: 0 },
    requests: { total: 0, pending: 0, approved: 0, delivered: 0 },
    deliveries: { total: 0, completed: 0 },
  });

  // Users management state
  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Listings management state
  const [donationsList, setDonationsList] = useState([]);

  // Requests state
  const [requestsList, setRequestsList] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch platform stats
      const statRes = await dashboardAPI.getStats();
      if (statRes.data && statRes.data.stats) {
        setStats(statRes.data.stats);
      }

      // Fetch users
      const usersRes = await usersAPI.getAll({
        role: userRoleFilter !== 'all' ? userRoleFilter : undefined,
        search: userSearch || undefined,
      });
      if (usersRes.data && usersRes.data.users) {
        setUsersList(usersRes.data.users);
      }

      // Fetch all donations
      const donRes = await donationsAPI.getAll({ status: 'all', limit: 50 });
      if (donRes.data && donRes.data.donations) {
        setDonationsList(donRes.data.donations);
      }

      // Fetch all requests
      const reqRes = await requestsAPI.getAll();
      if (reqRes.data && reqRes.data.requests) {
        setRequestsList(reqRes.data.requests);
      }
    } catch (err) {
      console.warn('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userRoleFilter]);

  // Toggle user active / suspended status
  const handleToggleUserStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      await usersAPI.update(targetUser._id, { status: newStatus });
      toast.success(`User status updated to: ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      await usersAPI.delete(userId);
      toast.success('User deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Delete food listing
  const handleDeleteListing = async (donationId) => {
    if (!window.confirm('Delete this food listing from the platform?')) return;
    try {
      await donationsAPI.delete(donationId);
      toast.success('Listing removed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  return (
    <DashboardLayout
      title="Platform Administration Portal"
      subtitle="Oversee users, food safety compliance, listings, and delivery logistics"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-8">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.users?.total || usersList.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Donors, NGOs, Couriers</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Food Donations</p>
              <p className="text-2xl font-black text-primary-600 mt-1">{stats.donations?.total || donationsList.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Listings posted</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Donations</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{stats.donations?.completed || 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Meals rescued from landfill</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Volunteers</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{stats.users?.volunteers || 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Registered delivery drivers</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition relative ${
              activeTab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            System Overview
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 transition relative ${
              activeTab === 'users'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Manage Users ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 transition relative ${
              activeTab === 'listings'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Manage Food Listings ({donationsList.length})
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 transition relative ${
              activeTab === 'requests'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Donation Requests ({requestsList.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* User Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">User Role Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Donors (Restaurants & Supermarkets)</span>
                  <span className="font-bold text-slate-900">{stats.users?.donors || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, ((stats.users?.donors || 1) / (stats.users?.total || 1)) * 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="font-semibold text-slate-600">Receivers (NGOs & Shelters)</span>
                  <span className="font-bold text-slate-900">{stats.users?.receivers || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, ((stats.users?.receivers || 1) / (stats.users?.total || 1)) * 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="font-semibold text-slate-600">Volunteers (Couriers)</span>
                  <span className="font-bold text-slate-900">{stats.users?.volunteers || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, ((stats.users?.volunteers || 1) / (stats.users?.total || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick System Summary */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">Platform Health & Safety</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                  <span className="font-semibold">Auto-Expiry Verification Engine</span>
                  <span className="font-bold bg-emerald-200/80 px-2 py-0.5 rounded-full text-[11px]">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
                  <span className="font-semibold">Real-Time Volunteer Task Dispatcher</span>
                  <span className="font-bold bg-blue-200/80 px-2 py-0.5 rounded-full text-[11px]">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 text-purple-900 border border-purple-100">
                  <span className="font-semibold">Database MongoDB Connection</span>
                  <span className="font-bold bg-purple-200/80 px-2 py-0.5 rounded-full text-[11px]">Connected</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filter & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                  placeholder="Search user by name, email, or organization..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700"
                >
                  <option value="all">All Roles</option>
                  <option value="donor">Donors</option>
                  <option value="receiver">Receivers / NGOs</option>
                  <option value="volunteer">Volunteers</option>
                  <option value="admin">Admins</option>
                </select>

                <button
                  onClick={fetchData}
                  className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Organization</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.profileImage}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'donor'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.role === 'receiver'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'volunteer'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{u.organizationName || '—'}</td>
                      <td className="p-3.5 text-slate-600">{u.phone}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition ${
                            u.status === 'active'
                              ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        {u._id !== user._id && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Food Listings Management */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">All Food Listings</h3>
              <p className="text-xs text-slate-500">Moderate and manage food items posted by commercial donors</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="p-3.5">Food Listing</th>
                    <th className="p-3.5">Donor</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Quantity</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donationsList.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.foodImage}
                            alt={item.foodName}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <Link to={`/donations/${item._id}`} className="font-bold text-slate-900 hover:text-primary-600">
                              {item.foodName}
                            </Link>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{item.pickupLocation?.fullAddress}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{item.donorId?.organizationName || item.donorId?.name}</td>
                      <td className="p-3.5 capitalize text-slate-600">{item.category.replace('_', ' ')}</td>
                      <td className="p-3.5 font-bold text-slate-800">{item.quantity} {item.unit}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteListing(item._id)}
                          className="text-xs text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Requests & Deliveries */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">All Donation Requests</h3>
              <p className="text-xs text-slate-500">Live requests and fulfillment statuses across the platform</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="p-3.5">Recipient NGO</th>
                    <th className="p-3.5">Food Item</th>
                    <th className="p-3.5">Requested Qty</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requestsList.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{req.receiverId?.organizationName || req.receiverId?.name}</td>
                      <td className="p-3.5 text-slate-700">{req.donationId?.foodName}</td>
                      <td className="p-3.5 font-bold text-slate-800">{req.requestedQuantity} {req.unit}</td>
                      <td className="p-3.5 text-slate-600 capitalize">{req.deliveryMethod.replace('_', ' ')}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
