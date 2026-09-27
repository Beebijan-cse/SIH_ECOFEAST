import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Leaf,
  Zap,
  Truck,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Eye,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { SurplusListing, Match, Pickup, ImpactMetrics, Kitchen } from '../../types';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonKPIGrid, SkeletonTable } from '../../components/common/SkeletonLoader';

export const KitchenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [surplusList, setSurplusList] = useState<SurplusListing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKitchenData = async () => {
      setLoading(true);
      if (user) {
        const k = await dataService.getKitchenByProfileId(user.id);
        setKitchen(k);
        const [sList, mList, pList, imp] = await Promise.all([
          dataService.getSurplusListings(),
          dataService.getMatches(),
          dataService.getPickups(),
          dataService.getImpactMetrics()
        ]);
        setSurplusList(sList);
        setMatches(mList);
        setPickups(pList);
        setImpact(imp);
      }
      setLoading(false);
    };

    loadKitchenData();
  }, [user]);

  // Aggregate stats
  const totalSurplusKg = surplusList.reduce((acc, curr) => acc + curr.quantity, 0);
  const completedPickups = pickups.filter((p) => p.status === 'completed');
  const activeMatches = matches.filter((m) => m.status === 'suggested' || m.status === 'accepted');
  const safeCount = surplusList.filter((s) => s.safety_status === 'safe').length;

  const foodSavedKg = completedPickups.reduce((acc, curr) => acc + (curr.surplus?.quantity || 25), 0) + 420;
  const mealsSupported = Math.round(foodSavedKg * 2.5);
  const co2AvoidedKg = Math.round(foodSavedKg * 2.5);

  const weeklyChartData = [
    { day: 'Mon', surplus: 80, saved: 75 },
    { day: 'Tue', surplus: 95, saved: 90 },
    { day: 'Wed', surplus: 60, saved: 60 },
    { day: 'Thu', surplus: 110, saved: 100 },
    { day: 'Fri', surplus: 130, saved: 125 },
    { day: 'Sat', surplus: 140, saved: 135 },
    { day: 'Sun', surplus: 70, saved: 70 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {kitchen?.name || user?.organization_name || 'Kitchen Dashboard'}
            </h1>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
              Institutional Kitchen
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time surplus management, HACCP safety certification, and automated NGO matching
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/kitchen/surplus/create"
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Surplus</span>
          </Link>
          <Link
            to="/kitchen/safety"
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Safety Check</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <SkeletonKPIGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total Surplus Logged"
            value={`${totalSurplusKg} kg`}
            subtext={`${surplusList.length} total batches`}
            icon={UtensilsCrossed}
            trend={{ value: '+14% this week', isPositive: true }}
            accentColor="emerald"
          />
          <KPICard
            label="Safety Certified"
            value={safeCount}
            subtext="HACCP compliant batches"
            icon={ShieldCheck}
            trend={{ value: '100% pass rate', isPositive: true }}
            accentColor="teal"
          />
          <KPICard
            label="Active Matches"
            value={activeMatches.length}
            subtext="Coordinating with NGOs"
            icon={Zap}
            trend={{ value: 'Avg 4.8 km radius', isPositive: true }}
            accentColor="blue"
          />
          <KPICard
            label="Meals Supported"
            value={mealsSupported.toLocaleString()}
            subtext={`${co2AvoidedKg} kg CO₂ avoided`}
            icon={Leaf}
            trend={{ value: '+22% impact', isPositive: true }}
            accentColor="amber"
          />
        </div>
      )}

      {/* Main Content Grid: Surplus Inventory & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Recent Surplus Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Surplus Batches
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current inventory requiring safety checks or pickup coordination
              </p>
            </div>
            <Link
              to="/kitchen/surplus"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <SkeletonTable rows={4} />
          ) : surplusList.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={UtensilsCrossed}
                title="No surplus food recorded yet"
                description="Log your first surplus batch after lunch or dinner service to begin safety checks."
                actionLabel="Create First Surplus"
                actionTo="/kitchen/surplus/create"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Food Item</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Storage</th>
                    <th className="py-3 px-4">Safety</th>
                    <th className="py-3 px-4">Pickup</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {surplusList.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{item.food_name}</p>
                        <p className="text-[11px] text-slate-500">{item.food_category}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {item.storage_type.split(' ')[0]}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.safety_status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.pickup_status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.safety_status === 'pending' ? (
                          <Link
                            to="/kitchen/safety"
                            state={{ selectedSurplusId: item.id }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <span>Verify</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : item.safety_status === 'safe' && item.pickup_status === 'available' ? (
                          <Link
                            to="/kitchen/matching"
                            state={{ selectedSurplusId: item.id }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <span>Match</span>
                            <Zap className="w-3 h-3 text-emerald-600" />
                          </Link>
                        ) : (
                          <Link
                            to="/kitchen/traceability"
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                          >
                            <span>Track</span>
                            <Clock className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Weekly Recovery Area Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Surplus vs Rescued (kg)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Weekly recovery efficiency across meal shifts
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="saved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSaved)" name="Rescued (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Recovery Efficiency:</span>
            <span className="font-bold text-emerald-700 font-mono">92.4%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
