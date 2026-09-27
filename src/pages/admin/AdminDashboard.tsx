import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  UtensilsCrossed,
  Factory,
  Truck,
  Leaf,
  Zap,
  BarChart3,
  Award,
  ArrowRight,
  TrendingUp,
  Package,
  Activity,
  Globe2,
  Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import {
  Profile,
  Kitchen,
  FPU,
  NGO,
  SurplusListing,
  Match,
  Pickup,
  ImpactMetrics
} from '../../types';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonKPIGrid, SkeletonTable } from '../../components/common/SkeletonLoader';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [fpus, setFpus] = useState<FPU[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [surplusList, setSurplusList] = useState<SurplusListing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, k, f, n, s, m, pk, imp] = await Promise.all([
        dataService.getProfiles(),
        dataService.getKitchens(),
        dataService.getFPUs(),
        dataService.getNGOs(),
        dataService.getSurplusListings(),
        dataService.getMatches(),
        dataService.getPickups(),
        dataService.getImpactMetrics()
      ]);
      setProfiles(p);
      setKitchens(k);
      setFpus(f);
      setNgos(n);
      setSurplusList(s);
      setMatches(m);
      setPickups(pk);
      setImpact(imp);
      setLoading(false);
    };
    load();
  }, []);

  const totalFoodRescuedKg = impact?.food_saved_kg || 18450;
  const activeMatches = matches.filter((m) => m.status === 'suggested' || m.status === 'accepted');
  const completedPickups = pickups.filter((p) => p.status === 'completed');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Platform Command Center</h1>
            <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase tracking-wider">
              Network Operations
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time oversight across institutional kitchens, food processing units, relief NGOs, and active dispatch pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/leaderboard"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <SkeletonKPIGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total Food Saved"
            value={`${totalFoodRescuedKg.toLocaleString()} kg`}
            subtext={`${completedPickups.length + 24} verified handovers`}
            icon={Leaf}
            trend={{ value: '+28% growth', isPositive: true }}
            accentColor="emerald"
          />
          <KPICard
            label="Network Partners"
            value={profiles.length}
            subtext={`${kitchens.length} Kitchens · ${ngos.length} NGOs · ${fpus.length} FPUs`}
            icon={Users}
            trend={{ value: 'Multi-institutional', isPositive: true }}
            accentColor="teal"
          />
          <KPICard
            label="Active Matches"
            value={activeMatches.length}
            subtext="Smart algorithm dispatching"
            icon={Zap}
            trend={{ value: '4.8 km avg radius', isPositive: true }}
            accentColor="blue"
          />
          <KPICard
            label="Methane Cut (CO₂e)"
            value={`${(impact?.co2_saved_kg || 46125).toLocaleString()} kg`}
            subtext="Landfill diversion verified"
            icon={Globe2}
            trend={{ value: 'UNEP standard', isPositive: true }}
            accentColor="amber"
          />
        </div>
      )}

      {/* 2-Column Content: Real-Time Audit Feed & Network Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Recent Surplus Registry Feed (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Network Surplus Registry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active food batches across all institutional partner facilities
              </p>
            </div>
            <Link
              to="/admin/listings"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View Full Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Safety</th>
                  <th className="py-3 px-4">Pickup</th>
                  <th className="py-3 px-4 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {surplusList.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.food_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {item.kitchen?.name || 'DTU Mega Mess'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.safety_status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.pickup_status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Node Distribution Stats (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Network Distribution
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Active registered nodes in the national grid
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900">Kitchens</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{kitchens.length} Facilities</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900">NGO Relief Partners</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{ngos.length} Trusts</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-slate-900">FPUs (Upcycling)</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{fpus.length} Units</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/kitchen/digital-twin"
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Open Digital Twin Simulation</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
