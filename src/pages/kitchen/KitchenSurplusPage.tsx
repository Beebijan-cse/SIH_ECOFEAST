import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  PlusCircle,
  ShieldCheck,
  Zap,
  Eye,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { SurplusListing, FoodCategory, SafetyStatus, PickupStatus } from '../../types';

export const KitchenSurplusPage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [filterSafety, setFilterSafety] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await dataService.getSurplusListings();
      setListings(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const filtered = listings.filter((item) => {
    if (filterSafety !== 'all' && item.safety_status !== filterSafety) return false;
    if (filterCategory !== 'all' && item.food_category !== filterCategory) return false;
    if (searchTerm && !item.food_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Surplus Inventory Registry</h1>
          </div>
          <p className="text-xs text-slate-500">
            Monitor all surplus batches, inspection status, holding temperatures, and dispatch progress.
          </p>
        </div>

        <Link
          to="/kitchen/surplus/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Surplus Batch</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search surplus by food name..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterSafety}
            onChange={(e) => setFilterSafety(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          >
            <option value="all">All Safety Statuses</option>
            <option value="pending">Pending Inspection</option>
            <option value="safe">Certified Safe</option>
            <option value="unsafe">Unsafe / Flagged</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="Cooked Meals">Cooked Meals</option>
            <option value="Rice">Rice</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Bakery">Bakery</option>
            <option value="Fruits">Fruits</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Batch Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Storage Protocol</th>
                <th className="py-3.5 px-4">Safety Status</th>
                <th className="py-3.5 px-4">Pickup Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No surplus batches found matching the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{item.food_name}</p>
                      <span className="text-[10px] font-mono text-slate-400">ID: {item.id}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.food_category}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.storage_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                          item.safety_status === 'safe'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.safety_status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.safety_status === 'safe'
                              ? 'bg-emerald-500'
                              : item.safety_status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {item.safety_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium capitalize text-slate-700">
                      {item.pickup_status}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.safety_status === 'pending' ? (
                          <Link
                            to="/kitchen/safety"
                            state={{ selectedSurplusId: item.id }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </Link>
                        ) : item.safety_status === 'safe' && item.pickup_status === 'available' ? (
                          <Link
                            to="/kitchen/matching"
                            state={{ selectedSurplusId: item.id }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Match</span>
                          </Link>
                        ) : (
                          <Link
                            to="/kitchen/traceability"
                            className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Journey</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
