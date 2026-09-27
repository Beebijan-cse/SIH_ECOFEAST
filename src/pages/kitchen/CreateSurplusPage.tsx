import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Thermometer,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Scale,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { FoodCategory, StorageType } from '../../types';

export const CreateSurplusPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState<FoodCategory>('Cooked Meals');
  const [quantity, setQuantity] = useState<number | ''>(25);
  const [unit, setUnit] = useState('kg');
  const [preparedTime, setPreparedTime] = useState(
    new Date(Date.now() - 3600000).toISOString().slice(0, 16)
  );
  const [expiryTime, setExpiryTime] = useState(
    new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 16)
  );
  const [storageType, setStorageType] = useState<StorageType>('Hot Hold (>60°C)');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(user?.location || 'Main Kitchen Loading Bay 1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const categories: FoodCategory[] = [
    'Cooked Meals',
    'Rice',
    'Vegetables',
    'Fruits',
    'Bakery',
    'Dairy',
    'Packaged Food',
    'Other'
  ];

  const storageOptions: StorageType[] = [
    'Hot Hold (>60°C)',
    'Cold Refrigerated (<4°C)',
    'Ambient / Dry (15-25°C)',
    'Frozen (<-18°C)'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setError('Please provide a descriptive food item name.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }
    if (new Date(expiryTime).getTime() <= new Date(preparedTime).getTime()) {
      setError('Expiry time must be set after preparation time.');
      return;
    }
    if (!user) {
      setError('You must be logged in as an institutional kitchen to log surplus.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const kitchens = await dataService.getKitchens();
      let kitchen = kitchens.find((k) => k.profile_id === user.id) || kitchens[0];

      const newListing = await dataService.createSurplusListing(
        {
          kitchen_id: kitchen?.id || 'ktch-01',
          food_name: foodName.trim(),
          food_category: foodCategory,
          quantity: Number(quantity),
          unit,
          prepared_at: new Date(preparedTime).toISOString(),
          expiry_time: new Date(expiryTime).toISOString(),
          storage_type: storageType,
          description: description || `Prepared at ${kitchen?.name || user.organization_name}. Handover via ${location}.`,
          latitude: kitchen?.latitude || 28.6139,
          longitude: kitchen?.longitude || 77.2090
        },
        user
      );

      setSuccess(true);
      setTimeout(() => {
        // Automatically direct user to Safety Verification page for this specific surplus
        navigate('/kitchen/safety', { state: { selectedSurplusId: newListing.id } });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save surplus listing.');
      setIsSubmitting(false);
    }
  };

  const estimatedMeals = quantity ? Math.round(Number(quantity) * 2.5) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Surplus Food Listing
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
          Record surplus from today's meal service. All batches proceed directly to HACCP temperature verification before NGO matching.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Surplus listing registered! Redirecting to Digital Safety Check...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Food Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Food Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Food Name / Menu Item *
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Steamed Basmati Rice & Dal Makhani"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={foodCategory}
                onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Quantity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quantity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Available Quantity *
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 35"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Unit of Measure *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="liters">Liters (L)</option>
                <option value="portions">Portions / Packets</option>
              </select>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">~{estimatedMeals} Community Meals</p>
                <p className="text-[10px] text-emerald-600">Standard 0.4 kg / portion metric</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Timing */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Timing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preparation Time *
              </label>
              <input
                type="datetime-local"
                required
                value={preparedTime}
                onChange={(e) => setPreparedTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
              <p className="text-[10px] text-slate-500 mt-1">Timestamp when food was cooked.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Safe Consumption Expiry *
              </label>
              <input
                type="datetime-local"
                required
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
              <p className="text-[10px] text-slate-500 mt-1">Must be delivered and consumed before this time.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Storage */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
              4
            </span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Storage
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Holding Condition *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {storageOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setStorageType(opt)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    storageType === opt
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Thermometer className={`w-4 h-4 shrink-0 mt-0.5 ${storageType === opt ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs">{opt}</p>
                    <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                      {opt.includes('Hot') ? 'Maintained above 60°C in food-grade insulated cambros' : opt.includes('Cold') ? 'Kept refrigerated under 4°C' : 'Stable ambient storage'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Location */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
              5
            </span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Location
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Handover Bay / Pickup Directions *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. DTU Mess Loading Bay 2 (Gate 3, North Campus)"
                className="w-full pl-3.5 pr-9 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Specific dock location for the volunteer driver.</p>
          </div>
        </div>

        {/* Section 6: Additional Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
            <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
              6
            </span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Additional Details
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Packaging & Handling Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Food packed in stainless steel degchis with foil seals. Contains dairy."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/kitchen/surplus"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording Batch...' : 'Proceed to Digital Safety Check'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
