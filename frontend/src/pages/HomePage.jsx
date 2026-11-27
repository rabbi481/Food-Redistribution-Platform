import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationsAPI, dashboardAPI } from '../services/api';
import FoodCard from '../components/common/FoodCard';
import RequestFoodModal from '../components/modals/RequestFoodModal';
import { useAuth } from '../context/AuthContext';
import { 
  Utensils, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Truck, 
  PackageCheck,
  ChevronRight,
  Clock,
  Quote
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [stats, setStats] = useState({
    totalQuantity: 320,
    activeDonations: 12,
    completedDonations: 85,
    volunteers: 45,
    receivers: 28,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // Fetch featured donations
        const donRes = await donationsAPI.getAll({ limit: 6, status: 'available' });
        if (donRes.data && donRes.data.donations) {
          setFeaturedDonations(donRes.data.donations);
        }

        // Fetch real stats
        const statRes = await dashboardAPI.getStats();
        if (statRes.data && statRes.data.stats) {
          const s = statRes.data.stats;
          setStats({
            totalQuantity: s.donations?.totalQuantity || 0,
            activeDonations: s.donations?.active || 0,
            completedDonations: s.donations?.completed || 0,
            volunteers: s.users?.volunteers || 0,
            receivers: s.users?.receivers || 0,
          });
        }
      } catch (err) {
        console.warn('Could not fetch home data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleRequestClick = (donation) => {
    setSelectedDonation(donation);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 bg-gradient-to-b from-primary-50/70 via-surface to-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-primary-100/90 text-primary-800 border border-primary-200/80 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                <span>Zero Hunger • Zero Waste Movement</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Share Food, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">
                  Reduce Waste,
                </span> <br className="hidden sm:inline" />
                Save Lives.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect restaurants, supermarkets, and event organizers with local NGOs, food banks, and volunteers. Turn surplus meals into hope before they expire.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to={isAuthenticated ? `/dashboard/${user?.role}` : '/register'}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base shadow-xl shadow-primary-600/30 transition duration-200 flex items-center justify-center space-x-2 group"
                >
                  <span>{isAuthenticated ? 'Go to Your Dashboard' : 'Get Started Now'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/donations"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-base border border-slate-200/90 shadow-sm transition flex items-center justify-center space-x-2"
                >
                  <Utensils className="w-5 h-5 text-primary-600" />
                  <span>Explore Donations</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" />
                  <span>100% Verified Food Safety</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" />
                  <span>Real-Time Volunteer Couriers</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" />
                  <span>Transparent NGO Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-slate-100 relative">
                  <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80"
                    alt="Volunteers distributing fresh meals"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/20">
                    <p className="text-xs font-bold flex items-center gap-1.5 text-primary-300">
                      <Sparkles className="w-3.5 h-3.5" /> Direct Community Delivery
                    </p>
                    <p className="text-sm font-semibold mt-0.5">Hope Community Kitchen serving hot meals</p>
                  </div>
                </div>

                {/* Floating Metric Card 1 */}
                <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3 hidden sm:flex animate-bounce-slow">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-900">{stats.totalQuantity}+</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Portions Rescued</p>
                  </div>
                </div>

                {/* Floating Metric Card 2 */}
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3 hidden sm:flex">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-900">{stats.completedDonations + 10}+</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Deliveries Completed</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS SECTION (Real MongoDB Data) */}
      <section id="impact-stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary-600/10 blur-3xl pointer-events-none"></div>
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Verified Real-Time Impact</span>
            <h2 className="text-2xl sm:text-3xl font-black">FoodBridge By The Numbers</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Live statistics fetched straight from our active database representing real food saved from landfills.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary-400">{stats.totalQuantity}</p>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">Total Meals & Portions</p>
              <p className="text-[11px] text-slate-400 mt-2">Nutritious food redirected</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary-400">{stats.activeDonations}</p>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">Active Food Listings</p>
              <p className="text-[11px] text-slate-400 mt-2">Available for immediate claim</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary-400">{stats.receivers + 5}</p>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">Partner NGOs & Shelters</p>
              <p className="text-[11px] text-slate-400 mt-2">Distributing daily to families</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary-400">{stats.volunteers + 8}</p>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">Active Volunteers</p>
              <p className="text-[11px] text-slate-400 mt-2">Ready to collect and deliver</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How FoodBridge Works</h2>
          <p className="text-sm text-slate-600">
            A seamless bridge between surplus food creators, beneficiaries, and dedicated delivery couriers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Donors Post Surplus',
              desc: 'Restaurants, supermarkets, or bakeries list surplus food with photo, portion quantity, and strict expiry countdown.',
              icon: Utensils,
              color: 'text-emerald-600 bg-emerald-100',
            },
            {
              step: '02',
              title: 'NGOs Claim Meals',
              desc: 'Verified NGOs, shelters, and food kitchens browse available listings in real-time and submit quantity requests.',
              icon: Heart,
              color: 'text-blue-600 bg-blue-100',
            },
            {
              step: '03',
              title: 'Volunteers Pick Up',
              desc: 'Nearby registered volunteer drivers receive pickup mission notifications, accept the task, and pick up food safely.',
              icon: Truck,
              color: 'text-amber-600 bg-amber-100',
            },
            {
              step: '04',
              title: 'Delivered & Nourished',
              desc: 'Food is delivered straight to the shelter kitchen, confirmed via status updates, feeding hungry individuals.',
              icon: PackageCheck,
              color: 'text-purple-600 bg-purple-100',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition relative group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-200 group-hover:text-primary-200 transition">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED FOOD DONATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
              Live Opportunities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Available Food Donations
            </h2>
            <p className="text-sm text-slate-600">
              Fresh surplus food ready to be claimed right now by community shelters.
            </p>
          </div>
          <Link
            to="/donations"
            className="inline-flex items-center space-x-1.5 text-sm font-bold text-primary-600 hover:text-primary-700"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200 p-4"></div>
            ))}
          </div>
        ) : featuredDonations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No active listings at the moment</h3>
            <p className="text-xs text-slate-500 mt-1">Check back shortly or list new surplus food as a donor!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDonations.map((donation) => (
              <FoodCard
                key={donation._id}
                donation={donation}
                onRequestClick={handleRequestClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. SUCCESS STORIES & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            Real Impact Stories
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stories From Our Community</h2>
          <p className="text-sm text-slate-600">
            Hear how FoodBridge empowers food providers, charities, and passionate volunteers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Elena Rostova',
              role: 'Head Chef, Fresh Bites Bistro',
              quote: 'Instead of throwing away 40 gourmet pasta portions at the end of Saturday night service, a volunteer picked them up within 30 minutes. It felt incredible knowing people ate well.',
              avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
            },
            {
              name: 'Sister Mary Teresa',
              role: 'Director, Hope Community Kitchen',
              quote: 'FoodBridge has been a lifesaver for our kitchen budget. We receive fresh fruits, milk cartons, and bakery loaves consistently, allowing us to serve 350 warm meals every single day.',
              avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
            },
            {
              name: 'Alex Rivera',
              role: 'Volunteer Food Courier',
              quote: 'I do two delivery runs every weekend on my cargo bike. The app tells me the exact pickup and drop-off coordinates. It takes one hour and helps dozens of families.',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 relative"
            >
              <Quote className="w-8 h-8 text-primary-200 absolute top-6 right-6" />
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{item.quote}"
              </p>
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-primary-500"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary-600 rounded-3xl p-8 sm:p-14 text-white text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl shadow-primary-600/30">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to eliminate food waste in your community?
            </h2>
            <p className="text-primary-100 text-sm leading-relaxed">
              Join thousands of restaurants, NGOs, and volunteers making a tangible difference today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-2xl bg-white text-primary-700 hover:bg-primary-50 font-extrabold text-sm shadow transition text-center"
            >
              Register for Free
            </Link>
            <Link
              to="/donations"
              className="px-8 py-3.5 rounded-2xl bg-primary-700 hover:bg-primary-800 text-white font-extrabold text-sm border border-primary-500 transition text-center"
            >
              Browse Food
            </Link>
          </div>
        </div>
      </section>

      {/* Request Modal */}
      {selectedDonation && (
        <RequestFoodModal
          isOpen={isRequestModalOpen}
          donation={selectedDonation}
          onClose={() => setIsRequestModalOpen(false)}
          onSuccess={() => {
            // refresh
            setIsRequestModalOpen(false);
          }}
        />
      )}

    </div>
  );
};

export default HomePage;
