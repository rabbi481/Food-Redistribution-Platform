import React, { useState, useEffect } from 'react';
import { donationsAPI } from '../services/api';
import FoodCard from '../components/common/FoodCard';
import RequestFoodModal from '../components/modals/RequestFoodModal';
import { Search, Filter, Utensils, Sparkles, MapPin } from 'lucide-react';

const DonationsCatalogPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isHalal, setIsHalal] = useState(false);

  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const params = {
        status: 'available',
        limit: 30,
      };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (isVegetarian) params.isVegetarian = 'true';
      if (isHalal) params.isHalal = 'true';

      const res = await donationsAPI.getAll(params);
      if (res.data && res.data.donations) {
        setDonations(res.data.donations);
      }
    } catch (err) {
      console.warn('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [category, isVegetarian, isHalal]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCatalog();
  };

  const handleRequestClick = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Headline */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
          Live Food Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Browse Available Food Donations
        </h1>
        <p className="text-sm text-slate-600">
          Explore surplus meals ready to be rescued from restaurants, bakeries, and grocers.
        </p>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by food name, ingredients, or city location..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="cooked_meals">Cooked Meals</option>
              <option value="bakery">Bakery</option>
              <option value="produce">Fresh Produce</option>
              <option value="dairy">Dairy Products</option>
              <option value="canned_packaged">Canned / Packaged</option>
              <option value="raw_ingredients">Raw Ingredients</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Dietary Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-2">Dietary Filters:</span>
          <button
            type="button"
            onClick={() => setIsVegetarian(!isVegetarian)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition ${
              isVegetarian
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            🌱 Vegetarian Only
          </button>

          <button
            type="button"
            onClick={() => setIsHalal(!isHalal)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition ${
              isHalal
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            🌙 Halal Only
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No food listings match your criteria</h3>
          <p className="text-xs text-slate-500">Try clearing some filters or searching for another keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <FoodCard
              key={donation._id}
              donation={donation}
              onRequestClick={handleRequestClick}
            />
          ))}
        </div>
      )}

      {/* Request Modal */}
      {selectedDonation && (
        <RequestFoodModal
          isOpen={isModalOpen}
          donation={selectedDonation}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCatalog();
          }}
        />
      )}

    </div>
  );
};

export default DonationsCatalogPage;
