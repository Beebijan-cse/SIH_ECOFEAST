import React, { useState, useEffect } from 'react';
import { Package, Search, ShieldCheck, Eye, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { SurplusListing } from '../../types';

export const AdminListingsPage: React.FC = () => {
  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dataService.getSurplusListings().then(setListings);
  }, []);

  const filtered = listings.filter((l) => {
    if (statusFilter !== 'all' && l.safety_status !== statusFilter) return false;
    if (search && !l.food_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-bold text-slate-900">Network Surplus Master Registry</h1>
        </div>
        <p className="text-xs text-slate-500">
          Complete cross-institutional food surplus logs, probe temperatures, safety certifications, and pickup handovers.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search surplus by item name..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
        >
          <option value="all">All Safety States</option>
          <option value="safe">Safe</option>
          <option value="pending">Pending Verification</option>
          <option value="unsafe">Unsafe / Discarded</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Batch Item & Ref</th>
                <th className="py-3.5 px-4">Origin Kitchen</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Safety Status</th>
                <th className="py-3.5 px-4">Pickup Status</th>
                <th className="py-3.5 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.food_name}
                    <span className="block text-[10px] font-mono text-slate-400 font-normal">
                      {item.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.kitchen?.name || 'DTU Mega Mess'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.food_category}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                        item.safety_status === 'safe'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.safety_status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.safety_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium capitalize text-slate-700">
                    {item.pickup_status}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/kitchen/traceability"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Trace</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
