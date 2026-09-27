import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  ArrowRight,
  Info,
  Scale,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { SurplusListing, SafetyCheck, SafetyStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const SafetyCheckPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [surplusList, setSurplusList] = useState<SurplusListing[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(68.5);
  const [appearance, setAppearance] = useState<'good' | 'fair' | 'poor'>('good');
  const [packaging, setPackaging] = useState<'sealed' | 'intact' | 'compromised'>('sealed');
  const [expiryStatus, setExpiryStatus] = useState<'valid' | 'near_expiry' | 'expired'>('valid');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadSurplus = async () => {
      const list = await dataService.getSurplusListings();
      setSurplusList(list);

      const navStateId = (location.state as any)?.selectedSurplusId;
      if (navStateId && list.some((l) => l.id === navStateId)) {
        setSelectedId(navStateId);
      } else if (list.length > 0) {
        const pending = list.find((l) => l.safety_status === 'pending');
        setSelectedId(pending ? pending.id : list[0].id);
      }
    };
    loadSurplus();
  }, [location.state]);

  const selectedSurplus = surplusList.find((s) => s.id === selectedId);

  // Dynamic HACCP Temperature evaluation
  const getTemperatureAssessment = (temp: number, storage: string | undefined) => {
    if (!storage) return { status: 'safe', label: 'Within verified safe limits', color: 'emerald' };

    if (storage.includes('Hot Hold')) {
      if (temp >= 60) return { status: 'safe', label: 'Safe Hot-Hold (>60°C HACCP compliant)', color: 'emerald' };
      if (temp >= 55) return { status: 'warning', label: 'Marginal Holding (55–60°C warning)', color: 'amber' };
      return { status: 'danger', label: 'DANGER ZONE (<60°C - Rapid Microbial Risk)', color: 'rose' };
    }

    if (storage.includes('Cold Refrigerated')) {
      if (temp <= 4) return { status: 'safe', label: 'Safe Cold-Hold (<4°C HACCP compliant)', color: 'emerald' };
      if (temp <= 8) return { status: 'warning', label: 'Marginal Chilling (4–8°C warning)', color: 'amber' };
      return { status: 'danger', label: 'DANGER ZONE (>8°C - Perishable Risk)', color: 'rose' };
    }

    return { status: 'safe', label: 'Standard Ambient Verification', color: 'emerald' };
  };

  const tempAssessment = getTemperatureAssessment(temperature, selectedSurplus?.storage_type);

  // Calculate Overall Status automatically based on scientific HACCP criteria
  const calculateOverallStatus = (): SafetyStatus => {
    if (expiryStatus === 'expired') return 'expired';
    if (appearance === 'poor' || packaging === 'compromised') return 'unsafe';
    if (tempAssessment.status === 'danger') return 'unsafe';
    return 'safe';
  };

  const overallStatus = calculateOverallStatus();

  const handleRunSafetyCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurplus || !user) return;

    setIsSubmitting(true);
    try {
      await dataService.recordSafetyCheck(
        {
          surplus_id: selectedSurplus.id,
          checked_by: user.id,
          temperature,
          appearance_status: appearance,
          packaging_status: packaging,
          expiry_status: expiryStatus,
          overall_status: overallStatus,
          notes: notes || `HACCP verification completed by ${user.full_name} (${user.organization_name}).`
        },
        user
      );

      setSuccessMsg(`Safety Verification Logged: Status [${overallStatus.toUpperCase()}].`);
      const updatedList = await dataService.getSurplusListings();
      setSurplusList(updatedList);

      setTimeout(() => {
        if (overallStatus === 'safe') {
          navigate('/kitchen/matching', { state: { selectedSurplusId: selectedSurplus.id } });
        }
      }, 1200);
    } catch (e: any) {
      console.error('Safety check failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900">Food Safety & HACCP Verification</h1>
        </div>
        <p className="text-xs text-slate-500">
          Verify digital probe temperatures, sensory quality, and airtight packaging seals before matching surplus to NGOs.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main 2-Column Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form & Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Batch Selector Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Batch for Inspection
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 bg-white"
            >
              {surplusList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.food_name} — {item.quantity} {item.unit} ({item.safety_status.toUpperCase()})
                </option>
              ))}
            </select>

            {selectedSurplus && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{selectedSurplus.food_name}</span>
                  <StatusBadge status={selectedSurplus.safety_status} size="sm" />
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                  <span>Qty: {selectedSurplus.quantity} {selectedSurplus.unit}</span>
                  <span>·</span>
                  <span>Storage: {selectedSurplus.storage_type}</span>
                  <span>·</span>
                  <span>Category: {selectedSurplus.food_category}</span>
                </div>
              </div>
            )}
          </div>

          {/* Inspection Controls Form */}
          <form onSubmit={handleRunSafetyCheck} className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Inspection Parameters
            </h3>

            {/* Temperature Slider & Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-emerald-600" />
                  <span>Digital Core Probe Temperature (°C) *</span>
                </label>
                <span className="text-base font-bold font-mono text-slate-900">
                  {temperature}°C
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0°C (Frozen)</span>
                <span>4°C (Cold Hold)</span>
                <span>60°C (Hot Hold Minimum)</span>
                <span>100°C (Boiling)</span>
              </div>
            </div>

            {/* Sensory Quality & Appearance */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Visual Inspection & Sensory Aroma *
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['good', 'fair', 'poor'] as const).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setAppearance(lvl)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center capitalize transition-all cursor-pointer ${
                      appearance === lvl
                        ? lvl === 'good'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                          : lvl === 'fair'
                          ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold'
                          : 'bg-rose-50 border-rose-500 text-rose-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Packaging Seal Check */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Container & Packaging Seal *
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['sealed', 'intact', 'compromised'] as const).map((pkg) => (
                  <button
                    type="button"
                    key={pkg}
                    onClick={() => setPackaging(pkg)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center capitalize transition-all cursor-pointer ${
                      packaging === pkg
                        ? pkg === 'compromised'
                          ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold'
                          : 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pkg}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspector Audit Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Probe calibrated at 14:00. Sealed in thermal transport vessel."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedSurplus}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging Verification...' : 'Certify & Save Safety Assessment'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: HACCP Live Gauge & Assessment (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Safety Status Evaluation */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              HACCP Decision Engine
            </h3>

            <div
              className={`p-4 rounded-xl border text-center space-y-2 ${
                overallStatus === 'safe'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : overallStatus === 'unsafe'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                Computed Outcome
              </p>
              <div className="text-2xl font-black tracking-tight font-mono">
                {overallStatus.toUpperCase()}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {overallStatus === 'safe'
                  ? 'Complies with all FSSAI holding protocols. Cleared for Smart NGO Dispatch.'
                  : 'Does not satisfy temperature or packaging thresholds. Cannot be dispatched to beneficiaries.'}
              </p>
            </div>

            {/* Temperature Reading Details */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Holding Protocol:</span>
                <span className="font-semibold text-slate-900">{selectedSurplus?.storage_type || 'Hot Hold'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Probe Reading:</span>
                <span className="font-mono font-bold text-slate-900">{temperature}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Status Check:</span>
                <span
                  className={`font-semibold ${
                    tempAssessment.color === 'emerald'
                      ? 'text-emerald-700'
                      : tempAssessment.color === 'amber'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {tempAssessment.label}
                </span>
              </div>
            </div>

            {/* HACCP Food Safety Rules Reference */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900 text-xs">Standard HACCP Thresholds:</h4>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-500">
                <li><strong className="text-slate-700">&gt;60°C:</strong> Hot-holding requirement for cooked curries & rice.</li>
                <li><strong className="text-slate-700">&lt;4°C:</strong> Cold-holding standard for dairy & perishables.</li>
                <li><strong className="text-slate-700">5°C–60°C:</strong> Danger zone. Meals held &gt;2 hrs must be condemned.</li>
              </ul>
            </div>

            {overallStatus === 'safe' && selectedSurplus && (
              <Link
                to="/kitchen/matching"
                state={{ selectedSurplusId: selectedSurplus.id }}
                className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Go to Smart Matching for this Batch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
