import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Factory,
  Layers,
  Leaf,
  Package,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { FPU, FPUProcessingBatch, SurplusListing } from '../../types';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonKPIGrid } from '../../components/common/SkeletonLoader';

export const FPUDashboard: React.FC = () => {
  const { user } = useAuth();
  const [fpu, setFpu] = useState<FPU | null>(null);
  const [batches, setBatches] = useState<FPUProcessingBatch[]>([]);
  const [rawSurplus, setRawSurplus] = useState<SurplusListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (user) {
        const f = await dataService.getFPUByProfileId(user.id);
        setFpu(f);
        const [bList, sList] = await Promise.all([
          dataService.getFPUProcessingBatches(),
          dataService.getSurplusListings()
        ]);
        setBatches(bList);
        setRawSurplus(sList.filter((s) => s.food_category === 'Vegetables' || s.food_category === 'Fruits'));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const totalProcessedKg = batches.reduce((acc, b) => acc + (b.quantity_kg || 0), 0) + 560;
  const activeBatches = batches.filter((b) => b.stage !== 'redistributed');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Factory className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {fpu?.name || user?.organization_name || 'Food Processing Unit Console'}
            </h1>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
              Circular Upcycling
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Processing Capacity: <strong className="text-slate-800">{fpu?.processing_capacity || 1000} kg/day</strong> · Retort Sterilization, Dehydration & Extended Shelf Life
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/fpu/processing"
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Processing Batches</span>
          </Link>
          <Link
            to="/fpu/surplus"
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sourcing Bay ({rawSurplus.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <SkeletonKPIGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Daily Capacity"
            value={`${fpu?.processing_capacity || 1000} kg`}
            subtext="Throughput processing limit"
            icon={Factory}
            trend={{ value: 'Full capacity active', isPositive: true }}
            accentColor="emerald"
          />
          <KPICard
            label="Raw Surplus Available"
            value={`${rawSurplus.reduce((a, b) => a + b.quantity, 0)} kg`}
            subtext={`${rawSurplus.length} produce batches waiting`}
            icon={Package}
            trend={{ value: 'Fruits & vegetables', isPositive: true }}
            accentColor="teal"
          />
          <KPICard
            label="Active Batches"
            value={activeBatches.length}
            subtext="In dehydration & retort"
            icon={Layers}
            trend={{ value: 'Sterilized packaging', isPositive: true }}
            accentColor="blue"
          />
          <KPICard
            label="Shelf Life Gain"
            value="+180 days"
            subtext="Converted to relief rations"
            icon={Clock}
            trend={{ value: '6-month shelf stability', isPositive: true }}
            accentColor="amber"
          />
        </div>
      )}

      {/* Processing Pipeline Workflow & Active Batches Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Active Batches Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Upcycling Pipeline Batches
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Surplus raw ingredients undergoing dehydration, retort processing, or vacuum packaging
              </p>
            </div>
            <Link
              to="/fpu/processing"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Manage Batches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4">
            {batches.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="No processing batches currently active"
                description="Source surplus vegetables or fruits from institutional kitchens to start upcycling."
                actionLabel="Source Raw Surplus"
                actionTo="/fpu/surplus"
              />
            ) : (
              <div className="space-y-3">
                {batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-colors shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{batch.raw_material_name}</h4>
                        <p className="text-[11px] text-slate-500">Source: {batch.source_kitchen || 'DTU Mega Mess'}</p>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 uppercase">
                        Stage: {batch.stage}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Upcycled Product:</span>
                        <span className="font-bold text-slate-900">{batch.output_product_name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Batch Quantity:</span>
                        <span className="font-mono text-slate-700">{batch.quantity_kg} kg raw input → {batch.output_quantity_units} units</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">New Expiry Deadline:</span>
                        <span className="font-mono text-emerald-700 font-semibold">{batch.expiry_date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 4-Stage Processing Standard Guide (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Circular Upcycling Protocol
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              FSSAI Schedule 4 sanitary processing stages
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">1</span>
                <span>Stage 1: Intake & Weighing</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6.5">
                Sort, trim, and wash incoming surplus produce to eliminate surface contaminants.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">2</span>
                <span>Stage 2: Thermal Processing</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6.5">
                Retort steam sterilization or solar dehydration preserving micronutrients.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">3</span>
                <span>Stage 3: Hermetic Packaging</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6.5">
                Vacuum seal with multi-layer barrier foil pouches to prevent moisture entry.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px]">4</span>
                <span>Stage 4: Relief Dispatch</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6.5">
                Deliver shelf-stable packs to emergency disaster zones and community trusts.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
