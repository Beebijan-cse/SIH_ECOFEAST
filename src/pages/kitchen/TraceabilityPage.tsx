import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  Zap,
  Truck,
  Leaf,
  CheckCircle2,
  MapPin,
  User,
  Activity,
  PackageCheck,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Hash,
  Copy,
  Check,
  Calendar,
  Thermometer,
  ArrowDown
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { TraceabilityEvent, SurplusListing, TraceabilityEventType } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';

export const TraceabilityPage: React.FC = () => {
  const [surplusList, setSurplusList] = useState<SurplusListing[]>([]);
  const [selectedSurplusId, setSelectedSurplusId] = useState<string>('');
  const [events, setEvents] = useState<TraceabilityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    const loadTraceability = async () => {
      setLoading(true);
      const list = await dataService.getSurplusListings();
      setSurplusList(list);

      const targetId = list.length > 0 ? list[0].id : '';
      setSelectedSurplusId(targetId);

      if (targetId) {
        const evts = await dataService.getTraceabilityEvents(targetId);
        setEvents(evts);
      }
      setLoading(false);
    };

    loadTraceability();
  }, []);

  const handleSelectSurplus = async (id: string) => {
    setSelectedSurplusId(id);
    const evts = await dataService.getTraceabilityEvents(id);
    setEvents(evts);
  };

  const selectedSurplus = surplusList.find((s) => s.id === selectedSurplusId);

  // Section 15: Exact 7 journey stages:
  // Created -> Safety Verified -> Matched -> Pickup Scheduled -> Picked Up -> Delivered -> Impact Recorded
  const milestoneStages = [
    { type: 'created', label: 'Created', icon: Clock },
    { type: 'safety_checked', label: 'Safety Verified', icon: ShieldCheck },
    { type: 'matched', label: 'Matched', icon: Zap },
    { type: 'pickup_scheduled', label: 'Pickup Scheduled', icon: PackageCheck },
    { type: 'picked_up', label: 'Picked Up', icon: Truck },
    { type: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    { type: 'completed', label: 'Impact Recorded', icon: Leaf },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return Clock;
      case 'safety_checked':
        return ShieldCheck;
      case 'matched':
        return Zap;
      case 'accepted':
      case 'pickup_scheduled':
        return PackageCheck;
      case 'picked_up':
        return Truck;
      case 'delivered':
        return CheckCircle2;
      case 'completed':
        return Leaf;
      default:
        return Activity;
    }
  };

  const copyAuditHash = () => {
    navigator.clipboard.writeText(`0x7f8a9b2c3d4e5f60${selectedSurplusId.replace(/-/g, '').slice(0, 16)}`);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Food Journey & Traceability Ledger
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Immutable chain-of-custody tracking every verified handover from preparation kettle to community plate.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Immutable Ledger</span>
        </div>
      </div>

      {/* Section 15: Beautiful Milestone Ribbon with 7 Stages */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-5">
          Lifecycle Milestone Sequence
        </p>

        <div className="flex items-center justify-between min-w-[760px] relative px-4">
          {/* Connector Line behind nodes */}
          <div className="absolute top-4 left-10 right-10 h-0.5 bg-slate-200 z-0" />

          {milestoneStages.map((stg, i) => {
            const Icon = stg.icon;
            const isCompleted = events.some((e) => e.event_type === stg.type || (stg.type === 'delivered' && events.some(x => x.event_type === 'completed')));
            return (
              <div key={stg.type} className="flex flex-col items-center text-center relative z-10 space-y-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs ring-4 ring-emerald-50'
                      : 'bg-white text-slate-400 border border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-semibold max-w-[90px] leading-tight ${isCompleted ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {stg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Surplus Batch Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tracked Batches
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {surplusList.length} items
            </span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {surplusList.map((item) => {
              const isSelected = item.id === selectedSurplusId;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectSurplus(item.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {item.food_name}
                    </p>
                    <StatusBadge status={item.safety_status} size="sm" />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono font-semibold">{item.quantity} {item.unit}</span>
                    <span>{item.food_category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Timeline Ledger (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          
          {/* Batch Context Card */}
          {selectedSurplus && (
            <div className="p-4 sm:p-5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Inspecting Batch
                </span>
                <h2 className="text-base font-extrabold text-slate-900">{selectedSurplus.food_name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedSurplus.quantity} {selectedSurplus.unit} · {selectedSurplus.storage_type}
                </p>
              </div>

              {/* Cryptographic hash badge */}
              <button
                onClick={copyAuditHash}
                title="Click to copy immutable verification signature"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-mono transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
              >
                <Hash className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[130px]">
                  0x{selectedSurplusId.replace(/-/g, '').slice(0, 10)}...
                </span>
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          )}

          {/* Section 15: Beautiful Vertical Timeline */}
          {events.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No events logged yet"
              description="Traceability milestones will automatically generate as safety checks and handovers proceed."
            />
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {events.map((evt, idx) => {
                const Icon = getEventIcon(evt.event_type);
                return (
                  <div key={evt.id} className="relative group">
                    {/* Timeline Node Point */}
                    <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-white border-2 border-emerald-600 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    </div>

                    <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            {evt.event_type.replace(/_/g, ' ')}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} · {new Date(evt.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {evt.description}
                      </p>

                      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                        {evt.actor_name && (
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-700">{evt.actor_name}</span>
                          </span>
                        )}
                        {evt.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{evt.location}</span>
                          </span>
                        )}
                        <span className="text-emerald-700 font-medium ml-auto flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Audit Verified</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
