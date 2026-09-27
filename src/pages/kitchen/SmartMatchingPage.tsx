import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  Building2,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { SurplusListing, Match, NGO } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';

export const SmartMatchingPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [surplusList, setSurplusList] = useState<SurplusListing[]>([]);
  const [selectedSurplusId, setSelectedSurplusId] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [list, nList] = await Promise.all([
        dataService.getSurplusListings(),
        dataService.getNGOs()
      ]);
      setNgos(nList);

      const safeList = list.filter((l) => l.safety_status === 'safe');
      setSurplusList(safeList);

      const navStateId = (location.state as any)?.selectedSurplusId;
      let targetId = '';
      if (navStateId && safeList.some((s) => s.id === navStateId)) {
        targetId = navStateId;
      } else if (safeList.length > 0) {
        targetId = safeList[0].id;
      }

      setSelectedSurplusId(targetId);
      if (targetId) {
        const computed = await dataService.generateMatchesForSurplus(targetId);
        setMatches(computed);
      }
      setLoading(false);
    };

    loadData();
  }, [location.state]);

  const handleSelectSurplus = async (id: string) => {
    setSelectedSurplusId(id);
    setActionSuccess(null);
    const computed = await dataService.generateMatchesForSurplus(id);
    setMatches(computed);
  };

  const handleAcceptMatch = async (matchId: string) => {
    if (!user) return;
    const accepted = await dataService.acceptMatch(matchId, user);
    if (accepted) {
      setActionSuccess('Match Accepted! Dispatch logistics initialized and volunteer driver notified.');
      const updated = await dataService.getMatches();
      setMatches(updated.filter((m) => m.surplus_id === selectedSurplusId));
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    if (!user) return;
    await dataService.rejectMatch(matchId, user);
    setActionSuccess('Match rejected. Batch remains available for alternative dispatch.');
    const updated = await dataService.getMatches();
    setMatches(updated.filter((m) => m.surplus_id === selectedSurplusId));
  };

  const activeSurplus = surplusList.find((s) => s.id === selectedSurplusId);

  return (
    <div className="space-y-6">
      
      {/* Top Title Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Smart NGO Matching Engine</h1>
          </div>
          <p className="text-xs text-slate-500">
            Automated multi-factor matching ranking verified local NGOs by Haversine distance, urgency window, and intake capacity.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span>Algorithm: Haversine + Urgency + Capacity</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {surplusList.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200/90 text-center">
          <EmptyState
            icon={ShieldCheck}
            title="No certified safe surplus batches ready"
            description="Complete HACCP verification on pending surplus to unlock algorithmic NGO matching recommendations."
            actionLabel="Verify Pending Surplus"
            actionTo="/kitchen/safety"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Select Safe Surplus (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Safe Surplus Batches
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {surplusList.length} ready
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {surplusList.map((item) => {
                const isSelected = item.id === selectedSurplusId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSurplus(item.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                        {item.food_name}
                      </p>
                      <StatusBadge status={item.pickup_status} size="sm" />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{item.quantity} {item.unit}</span>
                      <span>Expires in ~{Math.max(1, Math.round((new Date(item.expiry_time).getTime() - Date.now()) / 3600000))}h</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Algorithmic Matches (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Active Batch Summary Card */}
            {activeSurplus && (
              <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Target Batch for Dispatch
                  </span>
                  <h2 className="text-base font-bold text-slate-900">{activeSurplus.food_name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeSurplus.quantity} {activeSurplus.unit} · {activeSurplus.storage_type} · Category: {activeSurplus.food_category}
                  </p>
                </div>
                <div className="text-right self-start sm:self-auto">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estimated Servings</span>
                  <p className="text-lg font-bold font-mono text-emerald-700">
                    ~{Math.round(activeSurplus.quantity * 2.5)} meals
                  </p>
                </div>
              </div>
            )}

            {/* Matches List */}
            <div className="space-y-3">
              {matches.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500">
                    Calculating matches for this batch...
                  </p>
                </div>
              ) : (
                matches.map((m) => {
                  const ngo = ngos.find((n) => n.id === m.ngo_id);
                  const isAccepted = m.status === 'accepted';
                  const isRejected = m.status === 'rejected';

                  return (
                    <div
                      key={m.id}
                      className={`bg-white rounded-xl p-5 border transition-all ${
                        isAccepted
                          ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                          : isRejected
                          ? 'border-slate-200 opacity-60'
                          : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <h4 className="text-sm font-bold text-slate-900">
                              {ngo?.name || 'Verified Relief Partner'}
                            </h4>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {m.distance_km} km away
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Service Area: {ngo?.service_area || 'Central Relief Cluster'} · Daily Quota: {ngo?.daily_intake_capacity} kg
                          </p>
                        </div>

                        {/* Match Score Indicator */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match Score</span>
                            <div className="text-xl font-black font-mono text-emerald-600">
                              {m.match_score}<span className="text-xs font-normal text-slate-400">/100</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rationale description */}
                      <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                        {m.reason}
                      </p>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-500">
                          Status: <strong className="uppercase font-mono text-slate-700">{m.status}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isAccepted && !isRejected && (
                            <>
                              <button
                                onClick={() => handleRejectMatch(m.id)}
                                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleAcceptMatch(m.id)}
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Match & Dispatch</span>
                              </button>
                            </>
                          )}
                          {isAccepted && (
                            <Link
                              to="/kitchen/traceability"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                            >
                              <span>View in Traceability Ledger</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
