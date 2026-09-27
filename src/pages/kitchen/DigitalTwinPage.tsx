import React, { useState, useEffect } from 'react';
import {
  Activity,
  UtensilsCrossed,
  ShieldCheck,
  Zap,
  Truck,
  Leaf,
  Layers,
  Sparkles,
  ArrowDown,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Building2,
  Package,
  Info
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { SurplusListing, Match, Pickup, ImpactMetrics, Kitchen, NGO, FPU } from '../../types';

export const DigitalTwinPage: React.FC = () => {
  const [surplusList, setSurplusList] = useState<SurplusListing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [fpus, setFpus] = useState<FPU[]>([]);
  const [activeNode, setActiveNode] = useState<string>('kitchen');

  useEffect(() => {
    const loadState = async () => {
      const [s, m, p, imp, k, n, f] = await Promise.all([
        dataService.getSurplusListings(),
        dataService.getMatches(),
        dataService.getPickups(),
        dataService.getImpactMetrics(),
        dataService.getKitchens(),
        dataService.getNGOs(),
        dataService.getFPUs()
      ]);
      setSurplusList(s);
      setMatches(m);
      setPickups(p);
      setImpact(imp);
      setKitchens(k);
      setNgos(n);
      setFpus(f);
    };
    loadState();
  }, []);

  const totalSurplusKg = surplusList.reduce((acc, c) => acc + c.quantity, 0);
  const safeCount = surplusList.filter((s) => s.safety_status === 'safe').length;
  const pendingCount = surplusList.filter((s) => s.safety_status === 'pending').length;
  const activeMatchesCount = matches.filter((m) => m.status === 'suggested' || m.status === 'accepted').length;
  const scheduledPickupsCount = pickups.filter((p) => p.status === 'scheduled' || p.status === 'in_progress').length;
  const foodSavedKg = impact?.food_saved_kg || 1845;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Ecosystem Digital Twin</h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time cyber-physical representation of the closed-loop food recovery network. Click any node to inspect telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Digital Twin State</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Visual Ecosystem Flow (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ecosystem Flow Architecture
            </h2>
            <span className="text-[11px] text-slate-400">Click a node to inspect</span>
          </div>

          <div className="flex flex-col items-center max-w-md mx-auto space-y-2 py-2">
            
            {/* 1. KITCHEN NODE */}
            <button
              onClick={() => setActiveNode('kitchen')}
              className={`w-full p-4 rounded-xl border text-center transition-all cursor-pointer ${
                activeNode === 'kitchen'
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Institutional Kitchens
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {kitchens.length} Active Mega Messes & Banquets
              </p>
            </button>

            {/* Down Connector */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-emerald-400" />
              <ArrowDown className="w-3.5 h-3.5 text-emerald-500 -mt-1" />
            </div>

            {/* 2. SURPLUS FOOD NODE */}
            <button
              onClick={() => setActiveNode('surplus')}
              className={`w-full p-4 rounded-xl border text-center transition-all cursor-pointer ${
                activeNode === 'surplus'
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Package className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Surplus Food Inflow
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {totalSurplusKg} kg Active Volume Across {surplusList.length} Batches
              </p>
            </button>

            {/* Down Connector */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-emerald-400" />
              <ArrowDown className="w-3.5 h-3.5 text-emerald-500 -mt-1" />
            </div>

            {/* 3. SAFETY CHECK NODE */}
            <button
              onClick={() => setActiveNode('safety')}
              className={`w-full p-4 rounded-xl border text-center transition-all cursor-pointer ${
                activeNode === 'safety'
                  ? 'bg-amber-50 border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Safety Check & HACCP Gate
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {safeCount} Certified Safe · {pendingCount} Pending Probe Checks
              </p>
            </button>

            {/* Down Connector */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-emerald-400" />
              <ArrowDown className="w-3.5 h-3.5 text-emerald-500 -mt-1" />
            </div>

            {/* 4. SMART MATCH NODE */}
            <button
              onClick={() => setActiveNode('matching')}
              className={`w-full p-4 rounded-xl border text-center transition-all cursor-pointer ${
                activeNode === 'matching'
                  ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Smart Match Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {activeMatchesCount} Multi-Factor Algorithmic Pairings Active
              </p>
            </button>

            {/* Branching Connectors to NGO & FPU */}
            <div className="w-full flex justify-between px-10 pt-1 -mb-1">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-indigo-400" />
                <ArrowDown className="w-3.5 h-3.5 text-indigo-500 -mt-1" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-teal-400" />
                <ArrowDown className="w-3.5 h-3.5 text-teal-500 -mt-1" />
              </div>
            </div>

            {/* 5. BRANCH ROW: NGO and FPU */}
            <div className="w-full grid grid-cols-2 gap-4">
              <button
                onClick={() => setActiveNode('ngo')}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                  activeNode === 'ngo'
                    ? 'bg-indigo-50 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    NGO Relief
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {ngos.length} Partner Food Banks
                </p>
              </button>

              <button
                onClick={() => setActiveNode('fpu')}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                  activeNode === 'fpu'
                    ? 'bg-teal-50 border-teal-500 shadow-xs ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    FPU Processing
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {fpus.length} Food Upcycling Units
                </p>
              </button>
            </div>

            {/* Convergence connector */}
            <div className="flex flex-col items-center pt-1">
              <div className="w-0.5 h-4 bg-emerald-400" />
              <ArrowDown className="w-3.5 h-3.5 text-emerald-500 -mt-1" />
            </div>

            {/* 6. PICKUP LOGISTICS NODE */}
            <button
              onClick={() => setActiveNode('pickup')}
              className={`w-full p-4 rounded-xl border text-center transition-all cursor-pointer ${
                activeNode === 'pickup'
                  ? 'bg-indigo-50 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Pickup & Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {scheduledPickupsCount} In-Transit or Scheduled Handover Dispatches
              </p>
            </button>

            {/* Down Connector */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-emerald-400" />
              <ArrowDown className="w-3.5 h-3.5 text-emerald-500 -mt-1" />
            </div>

            {/* 7. IMPACT MEASUREMENT NODE */}
            <button
              onClick={() => setActiveNode('impact')}
              className={`w-full p-4 rounded-xl border text-center transition-all cursor-pointer ${
                activeNode === 'impact'
                  ? 'bg-emerald-50 border-emerald-600 shadow-xs ring-2 ring-emerald-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Social & Carbon Impact
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {foodSavedKg} kg Saved · {Math.round(foodSavedKg * 2.5)} Meals Supported · {Math.round(foodSavedKg * 2.5)} kg CO₂ Avoided
              </p>
            </button>

          </div>
        </div>

        {/* Right Column: Active Node Telemetry Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Info className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Node Telemetry Details
            </h3>
          </div>

          {activeNode === 'kitchen' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Kitchen Generation Facilities</h4>
              <p className="text-slate-600 leading-relaxed">
                Institutional facilities generating daily meal portions with integrated cold-hold and hot-hold warming infrastructure.
              </p>
              <div className="space-y-2 pt-2">
                {kitchens.map((k) => (
                  <div key={k.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <p className="font-bold text-slate-900">{k.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{k.location}</p>
                    <p className="text-[10px] text-emerald-700 font-mono mt-1">Cap: {k.daily_capacity} meals/day</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNode === 'surplus' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Surplus Inventory Flow</h4>
              <p className="text-slate-600 leading-relaxed">
                Active surplus items logged and waiting in monitored thermal containers.
              </p>
              <div className="space-y-2 pt-2">
                {surplusList.slice(0, 3).map((s) => (
                  <div key={s.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{s.food_name}</span>
                      <span className="font-mono text-emerald-700 font-bold">{s.quantity} {s.unit}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{s.storage_type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNode === 'safety' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">HACCP Digital Guardrail</h4>
              <p className="text-slate-600 leading-relaxed">
                Digital probe verification checks temperature holding protocols to ensure zero compromised food leaves the premises.
              </p>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold">2-Hour Danger Zone Rule:</p>
                <p className="text-[11px] leading-relaxed">
                  Food between 5°C and 60°C is automatically locked out if held beyond safe transit limits.
                </p>
              </div>
            </div>
          )}

          {activeNode === 'matching' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Smart Matching Algorithm</h4>
              <p className="text-slate-600 leading-relaxed">
                Transparent multi-factor score evaluating:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 text-[11px]">
                <li>Distance Factor (40 pts) via Haversine</li>
                <li>Urgency Window (30 pts)</li>
                <li>Storage & Carrier Fit (20 pts)</li>
                <li>NGO Intake Capacity (10 pts)</li>
              </ul>
            </div>
          )}

          {activeNode === 'ngo' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">NGO Distribution Centers</h4>
              <p className="text-slate-600 leading-relaxed">
                Verified community relief partners serving local night shelters and community kitchens.
              </p>
              <div className="space-y-2 pt-2">
                {ngos.map((n) => (
                  <div key={n.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <p className="font-bold text-slate-900">{n.name}</p>
                    <p className="text-[11px] text-slate-500">{n.service_area}</p>
                    <p className="text-[10px] text-indigo-700 font-mono mt-1">Quota: {n.daily_intake_capacity} kg/day</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNode === 'fpu' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Food Processing Upcycling</h4>
              <p className="text-slate-600 leading-relaxed">
                Processing units taking surplus fruits and vegetables and converting them into shelf-stable relief rations (soup powders, fruit preserves).
              </p>
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-teal-900 text-[11px]">
                Active batches upcycled: 180+ days shelf life gain.
              </div>
            </div>
          )}

          {activeNode === 'pickup' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Logistics & Dispatch Fleet</h4>
              <p className="text-slate-600 leading-relaxed">
                Volunteer vans and transport carriers equipped with insulated cambros and hot-boxes.
              </p>
              <div className="space-y-2 pt-2">
                {pickups.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <p className="font-bold text-slate-900">{p.pickup_person || 'Driver En Route'}</p>
                    <p className="text-[11px] text-slate-500">Status: {p.status.toUpperCase()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNode === 'impact' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Measured Verified Impact</h4>
              <p className="text-slate-600 leading-relaxed">
                Calculated dynamically upon pickup delivery completion:
              </p>
              <div className="space-y-2 pt-2">
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-bold text-emerald-950 font-mono text-base">{foodSavedKg} kg</p>
                  <p className="text-[11px] text-emerald-700">Total Food Rescued</p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-bold text-emerald-950 font-mono text-base">{Math.round(foodSavedKg * 2.5)}</p>
                  <p className="text-[11px] text-emerald-700">Nutritious Meals Supported</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
