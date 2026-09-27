import React, { useState, useEffect } from 'react';
import { Award, Leaf, UtensilsCrossed, Factory, Truck, Medal, Crown } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { LeaderboardEntry } from '../../types';

export const AdminLeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'kitchen' | 'fpu' | 'ngo'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dataService.getLeaderboard(filterType).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [filterType]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-xs shadow-xs border border-amber-300">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center text-xs shadow-xs border border-slate-300">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-900 font-extrabold flex items-center justify-center text-xs shadow-xs border border-amber-200">
          🥉 3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">National Sustainability Leaderboard</h1>
          </div>
          <p className="text-xs text-slate-500">
            Recognizing institutional kitchens, processing units, and food banks leading zero-waste recovery.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Organizations
          </button>
          <button
            onClick={() => setFilterType('kitchen')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'kitchen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kitchens
          </button>
          <button
            onClick={() => setFilterType('fpu')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'fpu' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FPUs
          </button>
          <button
            onClick={() => setFilterType('ngo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'ngo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NGOs
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Organization Name</th>
                <th className="py-3.5 px-4">Stakeholder Type</th>
                <th className="py-3.5 px-4">Total Food Saved</th>
                <th className="py-3.5 px-4">Meals Supported</th>
                <th className="py-3.5 px-4">CO₂ Avoided</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex justify-center">
                      {getRankBadge(entry.rank)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {entry.organization_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                        entry.organization_type === 'kitchen'
                          ? 'bg-emerald-100 text-emerald-800'
                          : entry.organization_type === 'ngo'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {entry.organization_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-sm">
                    {entry.food_saved_kg.toLocaleString()} kg
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {entry.meals_supported.toLocaleString()} meals
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-teal-600">
                    {entry.co2_saved_kg.toLocaleString()} kg CO₂e
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
