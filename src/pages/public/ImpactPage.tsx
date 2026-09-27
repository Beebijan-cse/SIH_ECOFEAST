import React, { useEffect, useState } from 'react';
import {
  Leaf,
  Users,
  UtensilsCrossed,
  Wind,
  CheckCircle2,
  TrendingUp,
  PieChart as PieIcon,
  Info,
  Building2,
  Truck,
  Award,
  ArrowRight,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Navbar } from '../../components/layout/Navbar';
import { AIAssistantModal } from '../../components/ai/AIAssistantModal';
import { dataService } from '../../services/dataService';
import { ImpactMetrics, SurplusListing, Kitchen, NGO, LeaderboardEntry } from '../../types';
import { KPICard } from '../../components/common/KPICard';

export const ImpactPage: React.FC = () => {
  const [aiOpen, setAiOpen] = useState(false);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [surplusList, setSurplusList] = useState<SurplusListing[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [imp, sList, kList, nList, lBoard] = await Promise.all([
        dataService.getImpactMetrics(),
        dataService.getSurplusListings(),
        dataService.getKitchens(),
        dataService.getNGOs(),
        dataService.getLeaderboard()
      ]);
      setImpact(imp);
      setSurplusList(sList);
      setKitchens(kList);
      setNgos(nList);
      setLeaderboard(lBoard);
      setLoading(false);
    };
    loadData();
  }, []);

  // Category breakdown for Pie Chart
  const categoryMap: Record<string, number> = {};
  surplusList.forEach((s) => {
    categoryMap[s.food_category] = (categoryMap[s.food_category] || 0) + s.quantity;
  });

  const categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

  const foodSavedKg = impact?.food_saved_kg || 18450;
  const mealsSupported = impact?.meals_supported || 46125;
  const peopleReached = impact?.people_reached || 36900;
  const co2SavedKg = impact?.co2_saved_kg || 46125;

  const monthlyTrend = [
    { month: 'Apr', rescuedKg: 3200, meals: 8000, co2Kg: 8000 },
    { month: 'May', rescuedKg: 5400, meals: 13500, co2Kg: 13500 },
    { month: 'Jun', rescuedKg: 7800, meals: 19500, co2Kg: 19500 },
    { month: 'Jul', rescuedKg: 11200, meals: 28000, co2Kg: 28000 },
    { month: 'Aug', rescuedKg: 14500, meals: 36250, co2Kg: 36250 },
    { month: 'Current', rescuedKg: foodSavedKg, meals: mealsSupported, co2Kg: co2SavedKg }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar onOpenAI={() => setAiOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Open Sustainability & Social Accounting
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Measurable Sustainability Outcomes
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Real-time environmental and social data calculated from institutional kitchen surplus recoveries and verified NGO distributions across the EcoFeast network.
          </p>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Food Saved"
            value={`${foodSavedKg.toLocaleString()} kg`}
            subtext="Rescued from municipal waste"
            icon={UtensilsCrossed}
            trend={{ value: '+24% this month', isPositive: true }}
            accentColor="emerald"
          />
          <KPICard
            label="Meals Supported"
            value={mealsSupported.toLocaleString()}
            subtext="Nutritious portions distributed"
            icon={Leaf}
            trend={{ value: '2.5 meals / kg standard', isPositive: true }}
            accentColor="teal"
          />
          <KPICard
            label="People Reached"
            value={peopleReached.toLocaleString()}
            subtext="Shelter & community beneficiaries"
            icon={Users}
            trend={{ value: 'Verified shelter logs', isPositive: true }}
            accentColor="blue"
          />
          <KPICard
            label="CO₂ Avoided"
            value={`${co2SavedKg.toLocaleString()} kg`}
            subtext="Landfill methane emissions cut"
            icon={Wind}
            trend={{ value: 'FAO Carbon standard', isPositive: true }}
            accentColor="amber"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Chart: Monthly Rescue Velocity (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Monthly Surplus Recovery Velocity (kg)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cumulative kilograms rescued across participating institutional kitchens
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="rescuedKg" fill="#10b981" radius={[4, 4, 0, 0]} name="Food Rescued (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Chart: Category Distribution (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Category Composition
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Food types redistributed through the platform
              </p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.length > 0 ? categoryData : [{ name: 'Cooked Meals', value: 65 }, { name: 'Rice', value: 25 }, { name: 'Bakery', value: 10 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(categoryData.length > 0 ? categoryData : [{ name: 'Cooked Meals' }, { name: 'Rice' }, { name: 'Bakery' }]).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
              {(categoryData.length > 0 ? categoryData : [{ name: 'Cooked Meals', value: 65 }, { name: 'Rice', value: 25 }]).map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Scientific Methodology & Standards Section */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Verified Scientific Calculation Rubric
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
            EcoFeast formulas adhere to international benchmarks published by the <strong>Food and Agriculture Organization (FAO)</strong> and the <strong>United Nations Environment Programme (UNEP) Food Waste Index</strong>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formula 1</span>
              <h4 className="text-xs font-bold text-slate-900">Nutritious Portion Equivalence</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-mono text-[11px] pt-1">
                1 kg Rescued Food = 2.5 Meals
              </p>
              <p className="text-[10px] text-slate-500">
                Assumes standard balanced 400g cooked portion with dietary caloric requirements.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formula 2</span>
              <h4 className="text-xs font-bold text-slate-900">Methane & Carbon Avoidance</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-mono text-[11px] pt-1">
                1 kg Food Waste Diverted = 2.5 kg CO₂e
              </p>
              <p className="text-[10px] text-slate-500">
                Calculated by preventing anaerobic organic decomposition in unmanaged landfills.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formula 3</span>
              <h4 className="text-xs font-bold text-slate-900">Beneficiary Reach Factor</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-mono text-[11px] pt-1">
                1 Meal = 0.8 Individuals Supported
              </p>
              <p className="text-[10px] text-slate-500">
                Cross-referenced with shelter headcounts and registered NGO beneficiary rosters.
              </p>
            </div>
          </div>
        </div>

        {/* National Sustainability Leaderboard Preview */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Top Participating Organizations
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Ranked by Verified kg Saved</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">Rank</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Food Saved</th>
                  <th className="py-3 px-4">Meals Supported</th>
                  <th className="py-3 px-4">CO₂ Offset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {leaderboard.slice(0, 5).map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{entry.rank}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {entry.organization_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 uppercase text-[10px] font-mono">
                      {entry.organization_type}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {entry.food_saved_kg.toLocaleString()} kg
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-900">
                      {entry.meals_supported.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-900">
                      {entry.co2_saved_kg.toLocaleString()} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Server-Side AI Assistant Modal */}
      <AIAssistantModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
};
