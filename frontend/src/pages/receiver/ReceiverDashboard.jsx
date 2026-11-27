import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { donationsAPI, requestsAPI, dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FoodCard from '../../components/common/FoodCard';
import RequestFoodModal from '../../components/modals/RequestFoodModal';
import { 
  Utensils, 
  Search, 
  Filter, 
  ClipboardList, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Package,
  Calendar,
  Phone
} from 'lucide-react';

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(true);

  // Food catalog state
  const [availableDonations, setAvailableDonations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Requests state
  const [myRequests, setMyRequests] = useState([]);
  const [stats, setStats] = useState({
    myRequests: 0,
    myPending: 0,
    myDelivered: 0,
  });

  // Modal state
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch available donations
      const donRes = await donationsAPI.getAll({
        search: searchQuery || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: 'available',
      });
      if (donRes.data && donRes.data.donations) {
        setAvailableDonations(donRes.data.donations);
      }

      // Fetch my requests
      const reqRes = await requestsAPI.getAll();
      if (reqRes.data && reqRes.data.requests) {
        setMyRequests(reqRes.data.requests);
      }

      // Fetch dashboard stats
      const statRes = await dashboardAPI.getStats();
      if (statRes.data?.stats?.userStats) {
        setStats(statRes.data.stats.userStats);
      }
    } catch (err) {
      console.warn('Error loading receiver dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenRequest = (donation) => {
    setSelectedDonation(donation);
    setIsRequestModalOpen(true);
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this food request?')) return;
    try {
      await requestsAPI.updateStatus(requestId, { status: 'cancelled' });
      toast.info('Request has been cancelled');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">Pending Donor Review</span>;
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">Approved • Awaiting Pickup</span>;
      case 'assigned':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">Volunteer Assigned</span>;
      case 'picked_up':
      case 'in_transit':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">In Transit • Out for Delivery</span>;
      case 'delivered':
        return <span className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">Delivered & Received</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold">Rejected by Donor</span>;
      case 'cancelled':
        return <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold">Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <DashboardLayout
      title="Receiver / NGO Dashboard"
      subtitle={`Welcome, ${user?.organizationName || user?.name} (${user?.organizationType || 'Charity'})`}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-8">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Requests</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{myRequests.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Submitted by your organization</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active / In Progress</p>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {myRequests.filter((r) => ['pending', 'approved', 'assigned', 'in_transit', 'picked_up'].includes(r.status)).length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Awaiting or being delivered</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meals Delivered</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {myRequests
                  .filter((r) => r.status === 'delivered')
                  .reduce((acc, curr) => acc + (curr.requestedQuantity || 0), 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Portions successfully received</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-3 transition relative ${
              activeTab === 'browse'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Browse Available Food ({availableDonations.length})
          </button>

          <button
            onClick={() => setActiveTab('my-requests')}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === 'my-requests'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Food Requests</span>
            {myRequests.filter((r) => ['pending', 'approved', 'assigned', 'in_transit'].includes(r.status)).length > 0 && (
              <span className="bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                {myRequests.filter((r) => ['pending', 'approved', 'assigned', 'in_transit'].includes(r.status)).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 transition relative ${
              activeTab === 'history'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Received Food History
          </button>
        </div>

        {/* Tab 1: Browse Available Food */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search available food (e.g. pasta, bread, apples, soup)..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500"
                />
              </form>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700"
                >
                  <option value="all">All Categories</option>
                  <option value="cooked_meals">Cooked Meals</option>
                  <option value="bakery">Fresh Bakery</option>
                  <option value="produce">Fresh Produce</option>
                  <option value="dairy">Dairy</option>
                  <option value="canned_packaged">Canned / Packaged</option>
                </select>

                <button
                  onClick={fetchData}
                  className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow transition"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Food Grid */}
            {loading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 mt-2">Loading available food donations...</p>
              </div>
            ) : availableDonations.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">No matching food donations found</h4>
                <p className="text-xs text-slate-500">Try adjusting your search keywords or category filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableDonations.map((donation) => (
                  <FoodCard
                    key={donation._id}
                    donation={donation}
                    onRequestClick={handleOpenRequest}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Food Requests */}
        {activeTab === 'my-requests' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Track Food Requests</h3>
              <p className="text-xs text-slate-500">Live delivery status and communication for your claimed food</p>
            </div>

            {myRequests.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">You haven't requested any food yet</h4>
                <p className="text-xs text-slate-500">Browse available food listings and click "Request" to get meals.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((reqItem) => (
                  <div
                    key={reqItem._id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(reqItem.status)}
                        <span className="text-xs text-slate-400">
                          Requested on {new Date(reqItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900">
                        {reqItem.requestedQuantity} {reqItem.unit} of "{reqItem.donationId?.foodName}"
                      </h4>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p><span className="font-semibold text-slate-700">Donor:</span> {reqItem.donationId?.donorId?.organizationName || reqItem.donationId?.donorId?.name}</p>
                        <p><span className="font-semibold text-slate-700">Pickup Location:</span> {reqItem.donationId?.pickupLocation?.fullAddress}</p>
                        <p><span className="font-semibold text-slate-700">Delivery Address:</span> {reqItem.deliveryAddress}</p>
                      </div>

                      {reqItem.rejectionReason && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                          Rejection Reason: {reqItem.rejectionReason}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {reqItem.status === 'pending' && (
                      <div>
                        <button
                          onClick={() => handleCancelRequest(reqItem._id)}
                          className="px-3.5 py-2 border border-slate-300 hover:border-red-300 text-slate-600 hover:text-red-600 text-xs font-semibold rounded-xl transition"
                        >
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Delivered Food Logs</h3>
              <p className="text-xs text-slate-500">Record of food delivered to your organization</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="p-3.5">Food Item</th>
                    <th className="p-3.5">Donor</th>
                    <th className="p-3.5">Portions Received</th>
                    <th className="p-3.5">Delivery Date</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myRequests
                    .filter((r) => r.status === 'delivered')
                    .map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-800">{item.donationId?.foodName}</td>
                        <td className="p-3.5 text-slate-600">{item.donationId?.donorId?.organizationName || item.donationId?.donorId?.name}</td>
                        <td className="p-3.5 font-bold text-emerald-700">{item.requestedQuantity} {item.unit}</td>
                        <td className="p-3.5 text-slate-500">{new Date(item.updatedAt).toLocaleDateString()}</td>
                        <td className="p-3.5">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                            Delivered
                          </span>
                        </td>
                      </tr>
                    ))}
                  {myRequests.filter((r) => r.status === 'delivered').length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No completed food delivery records yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Request Modal */}
      {selectedDonation && (
        <RequestFoodModal
          isOpen={isRequestModalOpen}
          donation={selectedDonation}
          onClose={() => setIsRequestModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </DashboardLayout>
  );
};

export default ReceiverDashboard;
