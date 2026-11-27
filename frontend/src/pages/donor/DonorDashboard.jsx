import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { donationsAPI, requestsAPI, dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CreateDonationModal from '../../components/modals/CreateDonationModal';
import { 
  PlusCircle, 
  Package, 
  CheckCircle, 
  Clock, 
  Inbox, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  ExternalLink,
  MapPin,
  Calendar,
  Utensils
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DonorDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [myDonations, setMyDonations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [stats, setStats] = useState({
    myDonations: 0,
    myActiveDonations: 0,
    myCompletedDonations: 0,
    myIncomingRequests: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch donor's donations
      const donRes = await donationsAPI.getMyDonations();
      if (donRes.data && donRes.data.donations) {
        setMyDonations(donRes.data.donations);
      }

      // Fetch incoming requests for this donor
      const reqRes = await requestsAPI.getAll();
      if (reqRes.data && reqRes.data.requests) {
        setIncomingRequests(reqRes.data.requests);
      }

      // Fetch dashboard stats
      const statRes = await dashboardAPI.getStats();
      if (statRes.data?.stats?.userStats) {
        setStats(statRes.data.stats.userStats);
      }
    } catch (err) {
      console.warn('Error loading donor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle request approval
  const handleApproveRequest = async (requestId) => {
    try {
      await requestsAPI.updateStatus(requestId, { status: 'approved' });
      toast.success('Request approved! A volunteer courier task has been initiated.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request');
    }
  };

  // Handle request rejection
  const handleRejectRequest = async (requestId) => {
    const reason = window.prompt('Please provide a brief reason for rejection (optional):', 'Item no longer available');
    if (reason === null) return; // User cancelled prompt

    try {
      await requestsAPI.updateStatus(requestId, { status: 'rejected', rejectionReason: reason });
      toast.info('Request has been marked as rejected');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    }
  };

  // Handle delete donation
  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to delete this food donation listing?')) {
      return;
    }

    try {
      await donationsAPI.delete(donationId);
      toast.success('Food donation listing removed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  return (
    <DashboardLayout
      title="Donor Dashboard"
      subtitle={`Welcome back, ${user?.organizationName || user?.name}`}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onOpenCreateModal={() => setIsCreateModalOpen(true)}
    >
      <div className="space-y-8">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Listings</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.myDonations || myDonations.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">All time donations listed</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Listings</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {myDonations.filter((d) => ['available', 'partially_claimed'].includes(d.status)).length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Available for claim</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {myDonations.filter((d) => d.status === 'completed').length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Successfully redistributed</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Requests</p>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {incomingRequests.filter((r) => r.status === 'pending').length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Awaiting your approval</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Inbox className="w-6 h-6" />
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
            Active Listings ({myDonations.filter((d) => ['available', 'partially_claimed'].includes(d.status)).length})
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Incoming Requests</span>
            {incomingRequests.filter((r) => r.status === 'pending').length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                {incomingRequests.filter((r) => r.status === 'pending').length}
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
            Donation History ({myDonations.filter((d) => ['completed', 'expired', 'cancelled'].includes(d.status)).length})
          </button>
        </div>

        {/* Tab 1: Active Listings */}
        {(activeTab === 'overview' || activeTab === 'donations') && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Your Current Food Listings</h3>
                <p className="text-xs text-slate-500">Live food listings available for claiming by local shelters</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Food Listing</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 mt-2">Loading listings...</p>
              </div>
            ) : myDonations.filter((d) => ['available', 'partially_claimed'].includes(d.status)).length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">No active food listings</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Have surplus food from today's service or inventory? List it now to feed those in need.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Food Listing</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myDonations
                  .filter((d) => ['available', 'partially_claimed'].includes(d.status))
                  .map((donation) => (
                    <div
                      key={donation._id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-video">
                          <img
                            src={donation.foodImage}
                            alt={donation.foodName}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {donation.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-slate-900 text-sm">{donation.foodName}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2">{donation.description}</p>
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                            <span className="font-semibold text-slate-600">Remaining Qty:</span>
                            <span className="font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                              {donation.remainingQuantity !== undefined ? donation.remainingQuantity : donation.quantity} / {donation.quantity} {donation.unit}
                            </span>
                          </div>
                          <div className="flex items-center text-[11px] text-slate-400">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            <span>Expires: {new Date(donation.expiryDate).toLocaleDateString()} {new Date(donation.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          to={`/donations/${donation._id}`}
                          className="text-xs font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-1"
                        >
                          <span>Public Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleDeleteDonation(donation._id)}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded-lg transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Requests Management */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Incoming Food Requests</h3>
              <p className="text-xs text-slate-500">
                Review and approve requests from community charities and shelters.
              </p>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No incoming requests yet</h4>
                <p className="text-xs text-slate-500">When shelters request your listed food, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((reqItem) => (
                  <div
                    key={reqItem._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {reqItem.receiverId?.organizationName || reqItem.receiverId?.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          reqItem.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : reqItem.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {reqItem.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        Requested: <span className="font-bold text-slate-900">{reqItem.requestedQuantity} {reqItem.unit}</span> of "{reqItem.donationId?.foodName}"
                      </p>

                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{reqItem.message}"
                      </p>

                      <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 pt-1">
                        <span>Contact: {reqItem.contactPhone || reqItem.receiverId?.phone}</span>
                        <span>Delivery: {reqItem.deliveryMethod === 'volunteer_delivery' ? 'Volunteer Courier' : 'Self Pickup'}</span>
                        <span>Date: {new Date(reqItem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {reqItem.status === 'pending' && (
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleApproveRequest(reqItem._id)}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Dispatch</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(reqItem._id)}
                          className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
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
              <h3 className="text-lg font-bold text-slate-800">Completed & Past Donations</h3>
              <p className="text-xs text-slate-500">Record of food successfully rescued or expired</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="p-3.5">Food Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Original Qty</th>
                    <th className="p-3.5">Date Listed</th>
                    <th className="p-3.5">Final Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myDonations
                    .filter((d) => ['completed', 'expired', 'cancelled'].includes(d.status))
                    .map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-800">{item.foodName}</td>
                        <td className="p-3.5 capitalize text-slate-600">{item.category.replace('_', ' ')}</td>
                        <td className="p-3.5">{item.quantity} {item.unit}</td>
                        <td className="p-3.5 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {myDonations.filter((d) => ['completed', 'expired', 'cancelled'].includes(d.status)).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No past donation records yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal */}
      <CreateDonationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />
    </DashboardLayout>
  );
};

export default DonorDashboard;
