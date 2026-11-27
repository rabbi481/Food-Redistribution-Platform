import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { volunteerAPI, dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ArrowRight, 
  Navigation, 
  Check, 
  Package, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);

  // Volunteer tasks
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState({
    myAssignedTasks: 0,
    myCompletedDeliveries: 0,
    availableToAccept: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Available tasks
      const availRes = await volunteerAPI.getAvailableTasks();
      if (availRes.data && availRes.data.tasks) {
        setAvailableTasks(availRes.data.tasks);
      }

      // My tasks
      const myRes = await volunteerAPI.getMyTasks();
      if (myRes.data && myRes.data.tasks) {
        setMyTasks(myRes.data.tasks);
      }

      // Dashboard stats
      const statRes = await dashboardAPI.getStats();
      if (statRes.data?.stats?.userStats) {
        setStats(statRes.data.stats.userStats);
      }
    } catch (err) {
      console.warn('Error loading volunteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Accept task
  const handleAcceptTask = async (taskId) => {
    try {
      await volunteerAPI.acceptTask(taskId);
      toast.success('Delivery task accepted! Added to your active delivery missions.');
      setActiveTab('active');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept task');
    }
  };

  // Update task status (picked_up, in_transit, delivered)
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await volunteerAPI.updateStatus(taskId, { status: newStatus });
      toast.success(`Delivery status updated to: ${newStatus.replace('_', ' ')}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <DashboardLayout
      title="Volunteer Courier Dashboard"
      subtitle={`Ready to rescue food, ${user?.name}?`}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-8">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Missions</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{availableTasks.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tasks needing a volunteer</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Active Tasks</p>
              <p className="text-2xl font-black text-primary-600 mt-1">
                {myTasks.filter((t) => ['assigned', 'picked_up', 'in_transit'].includes(t.status)).length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Currently assigned to you</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Navigation className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deliveries Completed</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {myTasks.filter((t) => t.status === 'delivered').length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Meals safely delivered</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('available')}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === 'available'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Available Delivery Tasks</span>
            {availableTasks.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                {availableTasks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === 'active'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Active Deliveries</span>
            {myTasks.filter((t) => ['assigned', 'picked_up', 'in_transit'].includes(t.status)).length > 0 && (
              <span className="bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                {myTasks.filter((t) => ['assigned', 'picked_up', 'in_transit'].includes(t.status)).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 transition relative ${
              activeTab === 'completed'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Delivery History ({myTasks.filter((t) => t.status === 'delivered').length})
          </button>
        </div>

        {/* Tab 1: Available Tasks */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Open Delivery Missions</h3>
              <p className="text-xs text-slate-500">Pick up approved food donations and deliver them to shelters</p>
            </div>

            {loading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 mt-2">Loading tasks...</p>
              </div>
            ) : availableTasks.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <Truck className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No open delivery missions right now</h4>
                <p className="text-xs text-slate-500">As soon as donors approve new requests, missions will appear here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          Open Mission
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="pt-3 space-y-4">
                        {/* Food info */}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase">Food Item</p>
                          <h4 className="font-extrabold text-base text-slate-900 mt-0.5">
                            {task.donationId?.foodName}
                          </h4>
                          <p className="text-xs text-primary-700 font-bold">
                            Quantity: {task.requestId?.requestedQuantity || task.donationId?.quantity} {task.donationId?.unit}
                          </p>
                        </div>

                        {/* Route: Pickup -> Delivery */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                          <div className="flex items-start space-x-2.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                              A
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-500 uppercase">Pickup Location</p>
                              <p className="text-xs font-bold text-slate-800">{task.pickupLocation?.fullAddress}</p>
                              <p className="text-[11px] text-slate-500">Contact: {task.pickupLocation?.contactPerson} ({task.pickupLocation?.contactPhone})</p>
                            </div>
                          </div>

                          <div className="border-l-2 border-dashed border-slate-300 ml-2.5 h-3"></div>

                          <div className="flex items-start space-x-2.5">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                              B
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-500 uppercase">Delivery Location</p>
                              <p className="text-xs font-bold text-slate-800">{task.deliveryLocation?.fullAddress}</p>
                              <p className="text-[11px] text-slate-500">Recipient: {task.deliveryLocation?.recipientName} ({task.deliveryLocation?.recipientPhone})</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptTask(task._id)}
                      className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Accept Delivery Mission</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Active Deliveries with interactive status updater */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Your Active Deliveries</h3>
              <p className="text-xs text-slate-500">Update status as you pick up and deliver the food items</p>
            </div>

            {myTasks.filter((t) => ['assigned', 'picked_up', 'in_transit'].includes(t.status)).length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No active delivery tasks in progress</h4>
                <p className="text-xs text-slate-500">Check the "Available Delivery Tasks" tab to accept a mission!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {myTasks
                  .filter((t) => ['assigned', 'picked_up', 'in_transit'].includes(t.status))
                  .map((task) => (
                    <div
                      key={task._id}
                      className="bg-white rounded-3xl p-6 border-2 border-primary-500/40 shadow-lg space-y-6"
                    >
                      {/* Top Banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-primary-100 text-primary-800">
                            Active Mission in Progress
                          </span>
                          <h3 className="text-lg font-black text-slate-900 mt-2">
                            {task.donationId?.foodName}
                          </h3>
                        </div>

                        {/* Interactive Status Badges */}
                        <div className="flex items-center space-x-1 sm:space-x-2 text-xs font-bold">
                          <span className={`px-3 py-1.5 rounded-xl ${
                            task.status === 'assigned' ? 'bg-primary-600 text-white shadow' : 'bg-slate-100 text-slate-500'
                          }`}>
                            1. Assigned
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className={`px-3 py-1.5 rounded-xl ${
                            task.status === 'picked_up' ? 'bg-primary-600 text-white shadow' : 'bg-slate-100 text-slate-500'
                          }`}>
                            2. Picked Up
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className={`px-3 py-1.5 rounded-xl ${
                            task.status === 'in_transit' ? 'bg-primary-600 text-white shadow' : 'bg-slate-100 text-slate-500'
                          }`}>
                            3. In Transit
                          </span>
                        </div>
                      </div>

                      {/* Contact & Directions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-emerald-900 uppercase">Step 1: Pickup Location</p>
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent(task.pickupLocation?.fullAddress)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              <Navigation className="w-3 h-3" /> Map
                            </a>
                          </div>
                          <p className="text-sm font-extrabold text-slate-800">{task.pickupLocation?.fullAddress}</p>
                          <p className="text-xs text-slate-600">Contact: {task.pickupLocation?.contactPerson}</p>
                          <a
                            href={`tel:${task.pickupLocation?.contactPhone}`}
                            className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1" />
                            {task.pickupLocation?.contactPhone}
                          </a>
                          {task.pickupLocation?.instructions && (
                            <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-emerald-100 italic">
                              "{task.pickupLocation.instructions}"
                            </p>
                          )}
                        </div>

                        <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-blue-900 uppercase">Step 2: Delivery Destination</p>
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent(task.deliveryLocation?.fullAddress)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                            >
                              <Navigation className="w-3 h-3" /> Map
                            </a>
                          </div>
                          <p className="text-sm font-extrabold text-slate-800">{task.deliveryLocation?.fullAddress}</p>
                          <p className="text-xs text-slate-600">Recipient: {task.deliveryLocation?.recipientName}</p>
                          <a
                            href={`tel:${task.deliveryLocation?.recipientPhone}`}
                            className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-800"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1" />
                            {task.deliveryLocation?.recipientPhone}
                          </a>
                          {task.deliveryLocation?.instructions && (
                            <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-blue-100 italic">
                              "{task.deliveryLocation.instructions}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Step Status Action Buttons */}
                      <div className="pt-2 flex flex-wrap gap-3">
                        {task.status === 'assigned' && (
                          <button
                            onClick={() => handleUpdateStatus(task._id, 'picked_up')}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow transition flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>I Have Picked Up The Food (Mark Picked Up)</span>
                          </button>
                        )}

                        {task.status === 'picked_up' && (
                          <button
                            onClick={() => handleUpdateStatus(task._id, 'in_transit')}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow transition flex items-center gap-2"
                          >
                            <Truck className="w-4 h-4" />
                            <span>Departing Towards Shelter (Mark In Transit)</span>
                          </button>
                        )}

                        {task.status === 'in_transit' && (
                          <button
                            onClick={() => handleUpdateStatus(task._id, 'delivered')}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Food Handed Over To Shelter (Mark Delivered)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Completed Deliveries */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Your Completed Deliveries</h3>
              <p className="text-xs text-slate-500">History of meals delivered to community kitchens</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="p-3.5">Food Rescued</th>
                    <th className="p-3.5">From</th>
                    <th className="p-3.5">Delivered To</th>
                    <th className="p-3.5">Completed At</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myTasks
                    .filter((t) => t.status === 'delivered')
                    .map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-800">{item.donationId?.foodName}</td>
                        <td className="p-3.5 text-slate-600">{item.pickupLocation?.contactPerson}</td>
                        <td className="p-3.5 text-slate-600">{item.deliveryLocation?.recipientName}</td>
                        <td className="p-3.5 text-slate-500">{new Date(item.deliveredAt || item.updatedAt).toLocaleDateString()}</td>
                        <td className="p-3.5">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                            Delivered
                          </span>
                        </td>
                      </tr>
                    ))}
                  {myTasks.filter((t) => t.status === 'delivered').length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No completed deliveries yet. Accept your first task above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
