import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { SurplusListing } from '../../types';

export const FPUSurplusPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [surplusList, setSurplusList] = useState<SurplusListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getSurplusListings().then((list) => {
      // Focus on raw farm surplus, produce, bakery, and shelf-stable potentials
      setSurplusList(list.filter((s) => s.safety_status === 'safe'));
      setLoading(false);
    });
  }, []);

  const handleSourceBatch = (item: SurplusListing) => {
    navigate('/fpu/processing', {
      state: {
        rawMaterialName: item.food_name,
        quantityKg: item.quantity,
        sourceSurplusId: item.id
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">Surplus Raw Material Sourcing Bay</h1>
          </div>
          <p className="text-xs text-slate-500">
            Source bulk surplus vegetables, fruits, and bakery items for industrial dehydration, retorting, and shelf-life extension.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {surplusList.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            No active surplus batches available in the sourcing pool right now.
          </div>
        ) : (
          surplusList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {item.food_category}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {item.quantity} {item.unit}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {item.food_name}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {item.description || 'Verified grade surplus ready for processing.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Source: {item.kitchen?.name || 'DTU Mega Mess'}</span>
                  <span className="text-emerald-700 font-semibold">Safety Certified</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  ID: {item.id.slice(-6)}
                </span>

                <button
                  type="button"
                  onClick={() => handleSourceBatch(item)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Start Processing Batch</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
