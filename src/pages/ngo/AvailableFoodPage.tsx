import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  Truck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService, calculateDistance } from '../../services/dataService';
import { SurplusListing, NGO } from '../../types';

export const AvailableFoodPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [surplusList, setSurplusList] = useState<SurplusListing[]>([]);
  const [ngo, setNgo] = useState<NGO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (user) {
        const n = await dataService.getNGOByProfileId(user.id);
        setNgo(n);
        const list = await dataService.getSurplusListings();
        // Only safe surplus
        setSurplusList(list.filter((l) => l.safety_status === 'safe' && l.pickup_status === 'available'));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleClaimSurplus = async (surplus: SurplusListing) => {
    if (!user || !ngo) return;
    setClaimingId(surplus.id);

    try {
      // Find or generate match, then accept
      const matches = await dataService.generateMatchesForSurplus(surplus.id);
      const targetMatch = matches.find((m) => m.ngo_id === ngo.id) || matches[0];

      if (targetMatch) {
        await dataService.acceptMatch(targetMatch.id, user);
        setClaimSuccess(`Successfully claimed ${surplus.food_name}! Pickup dispatch initiated.`);
        // Reload
        const updated = await dataService.getSurplusListings();
        setSurplusList(updated.filter((l) => l.safety_status === 'safe' && l.pickup_status === 'available'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaimingId(null);
    }
  };

  const filtered = surplusList.filter((item) => {
    if (categoryFilter !== 'all' && item.food_category !== categoryFilter) return false;
    if (searchTerm && !item.food_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Available Safe Food Surplus</h1>
          </div>
          <p className="text-xs text-slate-500">
            Certified safe batches ready for immediate NGO collection and shelter distribution.
          </p>
        </div>

        <Link
          to="/ngo/pickups"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Truck className="w-4 h-4" />
          <span>My Pickups</span>
        </Link>
      </div>

      {claimSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{claimSuccess}</span>
          </div>
          <Link to="/ngo/pickups" className="font-bold text-emerald-700 hover:text-emerald-800">
            View Dispatch Tracker →
          </Link>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search safe food (e.g. rice, rotis, bakery)..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          <option value="Cooked Meals">Cooked Meals</option>
          <option value="Rice">Rice</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Bakery">Bakery</option>
        </select>
      </div>

      {/* Food Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            No safe surplus food currently matches your filters. Please check back shortly.
          </div>
        ) : (
          filtered.map((item) => {
            const distance = ngo
              ? calculateDistance(
                  ngo.latitude || 28.6300,
                  ngo.longitude || 77.2200,
                  item.latitude || 28.6139,
                  item.longitude || 77.2090
                )
              : 5.2;

            const hoursRemaining = Math.max(
              0,
              Math.round((new Date(item.expiry_time).getTime() - Date.now()) / 3600000)
            );

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.food_category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {distance} km away
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2.5 leading-snug">
                    {item.food_name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.description || 'Prepared fresh at institutional facility.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Quantity</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {item.quantity} {item.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Safe Limit</span>
                      <span className="font-semibold text-rose-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {hoursRemaining}h remaining
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Storage: <strong>{item.storage_type}</strong></span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {item.id.slice(-6)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleClaimSurplus(item)}
                    disabled={claimingId === item.id}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{claimingId === item.id ? 'Claiming...' : 'Claim & Dispatch'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
