import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Match } from '../../types';

export const AdminMatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    dataService.getMatches().then(setMatches);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-bold text-slate-900">Matching Hub & Algorithmic Audit</h1>
        </div>
        <p className="text-xs text-slate-500">
          Inspection of multi-factor match recommendations, distance formulas, score accuracy, and acceptance rates.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Surplus Batch</th>
                <th className="py-3.5 px-4">Assigned NGO</th>
                <th className="py-3.5 px-4">Distance</th>
                <th className="py-3.5 px-4">Match Score</th>
                <th className="py-3.5 px-4">Algorithmic Rationale</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matches.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {m.surplus?.food_name || 'Cooked Food Surplus'}
                    <span className="block text-[10px] font-mono text-slate-400 font-normal">
                      ID: {m.surplus_id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {m.ngo?.name || 'Robin Hood Army & Feeding Hope'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    {m.distance_km} km
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-extrabold text-emerald-600 text-sm">
                      {m.match_score}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs text-[11px] leading-relaxed">
                    {m.reason}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                        m.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {m.status}
                    </span>
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
