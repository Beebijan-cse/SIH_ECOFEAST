import React, { useState, useEffect } from 'react';
import { Truck, Clock, MapPin, CheckCircle2, User } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Pickup } from '../../types';

export const AdminPickupsPage: React.FC = () => {
  const [pickups, setPickups] = useState<Pickup[]>([]);

  useEffect(() => {
    dataService.getPickups().then(setPickups);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Truck className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-bold text-slate-900">Platform Dispatch & Logistics Tracking</h1>
        </div>
        <p className="text-xs text-slate-500">
          Global overview of all active volunteer vehicles, scheduled collection windows, and delivered meals.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Surplus Batch</th>
                <th className="py-3.5 px-4">Destination NGO</th>
                <th className="py-3.5 px-4">Dispatched Driver</th>
                <th className="py-3.5 px-4">Scheduled Window</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Completed Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pickups.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.surplus?.food_name || 'Food Surplus'}
                    <span className="block text-[10px] font-mono text-slate-400 font-normal">
                      Ref: {p.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {p.ngo?.name || 'Robin Hood Army & Feeding Hope'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-mono">
                    {p.pickup_person || 'Mohit Kumar'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {p.pickup_date} at {p.pickup_time}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                        p.status === 'completed'
                          ? 'bg-purple-100 text-purple-800'
                          : p.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {p.completed_at ? new Date(p.completed_at).toLocaleTimeString() : 'In Progress'}
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
