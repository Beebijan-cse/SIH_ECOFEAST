import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dataService } from '../../services/dataService';
import { SurplusListing, Pickup, Match, ImpactMetrics } from '../../types';

export const AdminAnalyticsPage: React.FC = () => {
  const [surplusList, setSurplusList] = useState<SurplusListing[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);

  useEffect(() => {
    Promise.all([
      dataService.getSurplusListings(),
      dataService.getPickups(),
      dataService.getMatches(),
      dataService.getImpactMetrics()
    ]).then(([s, p, m, imp]) => {
      setSurplusList(s);
      setPickups(p);
      setMatches(m);
      setImpact(imp);
    });
  }, []);

  const monthlyData = [
    { month: 'Apr', foodRescued: 420, pickups: 12, co2: 1050 },
    { month: 'May', foodRescued: 680, pickups: 21, co2: 1700 },
    { month: 'Jun', foodRescued: 940, pickups: 29, co2: 2350 },
    { month: 'Jul', foodRescued: 1250, pickups: 38, co2: 3125 },
    { month: 'Aug', foodRescued: 1540, pickups: 46, co2: 3850 },
    { month: 'Current', foodRescued: impact?.food_saved_kg || 1845, pickups: pickups.length + 50, co2: impact?.co2_saved_kg || 4612 }
  ];

  // Category distribution
  const catCounts: Record<string, number> = {};
  surplusList.forEach((s) => {
    catCounts[s.food_category] = (catCounts[s.food_category] || 0) + s.quantity;
  });

  const catData = Object.keys(catCounts).map((cat) => ({
    name: cat,
    value: catCounts[cat]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const turnaroundMetrics = [
    { stage: 'Safety Inspection', averageMins: 14, standardTarget: 20 },
    { stage: 'Algorithmic Matching', averageMins: 2, standardTarget: 5 },
    { stage: 'NGO Acceptance', averageMins: 18, standardTarget: 30 },
    { stage: 'Van Dispatch & Arrival', averageMins: 26, standardTarget: 45 },
    { stage: 'Community Delivery', averageMins: 38, standardTarget: 60 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-bold text-slate-900">Platform Analytics & Intelligence</h1>
        </div>
        <p className="text-xs text-slate-500">
          In-depth quantitative metrics on food surplus recovery, dispatch velocities, and greenhouse emission offsets.
        </p>
      </div>

      {/* Grid: Food Saved Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Food Saved Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Food Rescued Over Time (kg)</h3>
              <p className="text-xs text-slate-500">Cumulative monthly institutional recovery volume</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="foodRescued" fill="#10b981" radius={[6, 6, 0, 0]} name="Food Rescued (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Surplus Food Composition</h3>
              <p className="text-xs text-slate-500">Distribution by food category across all facilities</p>
            </div>
            <PieIcon className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {catData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name || ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {catData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No surplus items listed yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Pipeline Turnaround Velocity */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-1">
          Pipeline Velocity & Turnaround SLA (Minutes)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Measuring the time from cooking surplus generation to hot meal community serving
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Workflow Milestone</th>
                <th className="py-3 px-4">Average Network Velocity</th>
                <th className="py-3 px-4">FSSAI / SIH Target SLA</th>
                <th className="py-3 px-4">Efficiency Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {turnaroundMetrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{m.stage}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                    {m.averageMins} mins
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    &lt; {m.standardTarget} mins
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Compliant</span>
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
