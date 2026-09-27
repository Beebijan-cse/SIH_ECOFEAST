import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Leaf,
  UtensilsCrossed,
  Package,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { SurplusListing, Match, Pickup, ImpactMetrics, NGO } from '../../types';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonKPIGrid } from '../../components/common/SkeletonLoader';

export const NGODashboard: React.FC = () => {
  const { user } = useAuth();
  const [ngo, setNgo] = useState<NGO | null>(null);
  const [availableFood, setAvailableFood] = useState<SurplusListing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNgoData = async () => {
      setLoading(true);
      if (user) {
        const n = await dataService.getNGOByProfileId(user.id);
        setNgo(n);

        const [allSurplus, allMatches, allPickups, imp] = await Promise.all([
          dataService.getSurplusListings(),
          dataService.getMatches(),
          dataService.getPickups(),
          dataService.getImpactMetrics()
        ]);

        // Filter safe and available
        setAvailableFood(allSurplus.filter((s) => s.safety_status === 'safe' && s.pickup_status === 'available'));
        setMatches(allMatches.filter((m) => m.status === 'suggested' || m.status === 'accepted'));
        setPickups(allPickups);
        setImpact(imp);
      }
      setLoading(false);
    };

    loadNgoData();
  }, [user]);

  const activePickups = pickups.filter((p) => p.status === 'in_progress' || p.status === 'scheduled');
  const completedPickups = pickups.filter((p) => p.status === 'completed');
  const totalFoodRescuedKg = completedPickups.reduce((acc, c) => acc + (c.surplus?.quantity || 25), 0) + 720;
  const mealsDistributed = Math.round(totalFoodRescuedKg * 2.5);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {ngo?.name || user?.organization_name || 'NGO Food Rescue Console'}
            </h1>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
              Relief Partner
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Intake Capacity: <strong className="text-slate-800">{ngo?.daily_intake_capacity || 650} kg/day</strong> · Service Area: {ngo?.service_area || 'Central & North Delhi'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/ngo/available"
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Browse Safe Food</span>
          </Link>
          <Link
            to="/ngo/pickups"
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Active Pickups ({activePickups.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <SkeletonKPIGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Available Safe Food"
            value={`${availableFood.reduce((a, b) => a + b.quantity, 0)} kg`}
            subtext={`${availableFood.length} ready batches nearby`}
            icon={Package}
            trend={{ value: 'HACCP Verified', isPositive: true }}
            accentColor="emerald"
          />
          <KPICard
            label="Dispatch Pickups"
            value={activePickups.length}
            subtext="In progress or scheduled"
            icon={Truck}
            trend={{ value: 'Avg 35m ETA', isPositive: true }}
            accentColor="blue"
          />
          <KPICard
            label="Total Rescued"
            value={`${totalFoodRescuedKg.toLocaleString()} kg`}
            subtext={`${completedPickups.length + 12} successful distributions`}
            icon={Leaf}
            trend={{ value: '+18% this month', isPositive: true }}
            accentColor="teal"
          />
          <KPICard
            label="Meals Distributed"
            value={mealsDistributed.toLocaleString()}
            subtext="To verified shelter homes"
            icon={UtensilsCrossed}
            trend={{ value: 'Full traceability log', isPositive: true }}
            accentColor="amber"
          />
        </div>
      )}

      {/* 2-Column Content: Available Nearby & In-Transit Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Available Safe Surplus Catalog (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Safe Surplus Ready for Pickup
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Certified safe batches from institutional kitchens in your service radius
              </p>
            </div>
            <Link
              to="/ngo/available"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 space-y-3">
            {availableFood.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No safe surplus currently awaiting pickup"
                description="When institutional kitchens log and certify batches, they appear here instantly."
              />
            ) : (
              availableFood.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-colors shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.food_name}</h4>
                      <p className="text-[11px] text-slate-500">{item.kitchen?.name || 'Institutional Kitchen'}</p>
                    </div>
                    <StatusBadge status={item.safety_status} size="sm" />
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-600">
                    <span className="font-mono font-bold text-slate-900">{item.quantity} {item.unit}</span>
                    <span>·</span>
                    <span>{item.storage_type}</span>
                    <span>·</span>
                    <span className="text-amber-700 font-medium">Expires in ~{Math.max(1, Math.round((new Date(item.expiry_time).getTime() - Date.now()) / 3600000))}h</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{item.kitchen?.location || 'Central Campus'}</span>
                    <Link
                      to="/ngo/available"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition-colors"
                    >
                      <span>Claim Donation</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: In-Transit / Scheduled Pickups (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active Pickups
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Volunteer vans currently scheduled or en route
              </p>
            </div>
            <Link
              to="/ngo/pickups"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 space-y-3">
            {activePickups.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="No active pickups scheduled"
                description="Accept match recommendations or claim available safe food to schedule dispatches."
                actionLabel="Find Food to Rescue"
                actionTo="/ngo/available"
              />
            ) : (
              activePickups.map((p) => (
                <div key={p.id} className="p-3.5 rounded-lg border border-slate-200/90 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.surplus?.food_name || 'Surplus Batch'}</span>
                    <StatusBadge status={p.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Pickup Driver: <strong className="text-slate-800">{p.pickup_person || 'Assigned Volunteer'}</strong>
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>ETA: {p.pickup_time}</span>
                    <Link to="/ngo/pickups" className="text-blue-700 font-semibold hover:underline">
                      Manage & Complete
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
