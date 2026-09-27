import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { Pickup, PickupWorkflowStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';

export const NGOPickupsPage: React.FC = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'in_progress' | 'completed'>('all');
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await dataService.getPickups();
      setPickups(list);
      setLoading(false);
    };
    load();
  }, []);

  const handleUpdateStatus = async (pickupId: string, newStatus: PickupWorkflowStatus) => {
    if (!user) return;
    const updated = await dataService.updatePickupStatus(pickupId, newStatus, user);
    if (updated) {
      if (newStatus === 'in_progress') {
        setActionMsg('Driver marked EN ROUTE. Thermal transport status updated in Traceability Ledger.');
      } else if (newStatus === 'completed') {
        setActionMsg('Delivery COMPLETED! Rescued kilograms and meals supported synchronized.');
      }
      const refreshed = await dataService.getPickups();
      setPickups(refreshed);
    }
  };

  const filtered = pickups.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Food Rescue Dispatches & Pickups</h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time transport tracking from kitchen docks to community distribution shelters.
          </p>
        </div>

        {/* Tab Controls (Functional segmented button) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({pickups.length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'scheduled' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setActiveTab('in_progress')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'in_progress' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En Route
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'completed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200/90 text-center">
          <EmptyState
            icon={Truck}
            title={`No ${activeTab === 'all' ? '' : activeTab.replace(/_/g, ' ')} pickups recorded`}
            description="When matches are accepted, pickup dispatch slots are created and managed here."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((pickup) => (
            <div
              key={pickup.id}
              className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-900">
                      {pickup.surplus?.food_name || 'Cooked Surplus Batch'}
                    </h3>
                    <StatusBadge status={pickup.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Source: <strong className="text-slate-800">{pickup.surplus?.kitchen?.name || 'DTU Mega Mess'}</strong> · {pickup.surplus?.food_category}
                  </p>
                </div>

                <div className="text-right self-start sm:self-auto">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Quantity</span>
                  <p className="text-lg font-bold font-mono text-emerald-700">
                    {pickup.surplus?.quantity || 25} {pickup.surplus?.unit || 'kg'}
                  </p>
                </div>
              </div>

              {/* Detail fields */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-500">Pickup Dock / Location:</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pickup.surplus?.kitchen?.location || 'Central Loading Dock'}</span>
                  </p>
                </div>

                <div>
                  <span className="text-slate-500">Scheduled Target Time:</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pickup.pickup_date} at {pickup.pickup_time}</span>
                  </p>
                </div>

                <div>
                  <span className="text-slate-500">Rescue Driver / Vehicle:</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pickup.pickup_person || 'Volunteer Driver'}</span>
                  </p>
                </div>
              </div>

              {pickup.notes && (
                <p className="mt-3 text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                  <strong className="text-slate-700">Driver Logistics Note:</strong> {pickup.notes}
                </p>
              )}

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                {pickup.status === 'scheduled' && (
                  <button
                    onClick={() => handleUpdateStatus(pickup.id, 'in_progress')}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Mark En Route</span>
                  </button>
                )}

                {pickup.status === 'in_progress' && (
                  <button
                    onClick={() => handleUpdateStatus(pickup.id, 'completed')}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Delivery Handover (Complete)</span>
                  </button>
                )}

                {pickup.status === 'completed' && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Delivered to Shelter & Meals Recorded</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
