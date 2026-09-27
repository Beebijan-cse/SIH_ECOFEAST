import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  Package
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { FPUProcessingBatch } from '../../types';

export const FPUProcessingPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [batches, setBatches] = useState<FPUProcessingBatch[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form states
  const [rawMaterialName, setRawMaterialName] = useState('');
  const [quantityKg, setQuantityKg] = useState<number | ''>(50);
  const [outputProductName, setOutputProductName] = useState('');
  const [outputQuantityUnits, setOutputQuantityUnits] = useState<number | ''>(100);
  const [expiryDays, setExpiryDays] = useState(180);
  const [notes, setNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    dataService.getFPUProcessingBatches().then(setBatches);

    // If navigated from Sourcing Bay with pre-filled state
    const state = location.state as any;
    if (state?.rawMaterialName) {
      setRawMaterialName(state.rawMaterialName);
      setQuantityKg(state.quantityKg || 50);
      setOutputProductName(`Pasteurized & Pureed ${state.rawMaterialName}`);
      setShowNewModal(true);
    }
  }, [location.state]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawMaterialName || !quantityKg || !outputProductName || !outputQuantityUnits) return;

    const newBatch: FPUProcessingBatch = {
      id: 'fpu-b-' + Date.now(),
      fpu_id: 'fpu-01',
      raw_material_name: rawMaterialName,
      quantity_kg: Number(quantityKg),
      stage: 'received',
      output_product_name: outputProductName,
      output_quantity_units: Number(outputQuantityUnits),
      processing_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + expiryDays * 86400000).toISOString().split('T')[0],
      notes: notes || 'Processed in accordance with FSSAI hygiene schedule 4.',
      created_at: new Date().toISOString()
    };

    await dataService.saveFPUProcessingBatch(newBatch);
    const updated = await dataService.getFPUProcessingBatches();
    setBatches(updated);
    setShowNewModal(false);
    setActionSuccess(`New processing batch "${outputProductName}" initialized in Received stage.`);
  };

  const handleAdvanceStage = async (batch: FPUProcessingBatch) => {
    let nextStage: FPUProcessingBatch['stage'] = 'processed';
    if (batch.stage === 'received') nextStage = 'processed';
    else if (batch.stage === 'processed') nextStage = 'packed';
    else if (batch.stage === 'packed') nextStage = 'redistributed';
    else return;

    const updatedBatch = { ...batch, stage: nextStage };
    await dataService.saveFPUProcessingBatch(updatedBatch);
    const updated = await dataService.getFPUProcessingBatches();
    setBatches(updated);

    if (nextStage === 'redistributed') {
      await dataService.incrementImpact(batch.quantity_kg);
      setActionSuccess(`Batch "${batch.output_product_name}" marked as REDISTRIBUTED! Impact metrics updated.`);
    } else {
      setActionSuccess(`Batch advanced to ${nextStage.toUpperCase()} stage.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">Food Processing Batches & Preservation</h1>
          </div>
          <p className="text-xs text-slate-500">
            Upcycling workflow: Received → Processed (Thermal/Dehydrated) → Packed (Airtight) → Ready for Redistribution.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Processing Batch</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Batches Table with Stage Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Active Processing Operations</h3>
          <span className="text-xs text-slate-500">{batches.length} Total Batches</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Raw Ingredient</th>
                <th className="py-3.5 px-4">Input Qty</th>
                <th className="py-3.5 px-4">Finished Product</th>
                <th className="py-3.5 px-4">Output Units</th>
                <th className="py-3.5 px-4">Processing Stage</th>
                <th className="py-3.5 px-4">Extended Expiry</th>
                <th className="py-3.5 px-4 text-right">Advance Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {b.raw_material_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {b.quantity_kg} kg
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {b.output_product_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                    {b.output_quantity_units} units
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                        b.stage === 'redistributed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.stage === 'packed'
                          ? 'bg-blue-100 text-blue-800'
                          : b.stage === 'processed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {b.stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {b.expiry_date}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {b.stage !== 'redistributed' ? (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStage(b)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <span>
                          {b.stage === 'received'
                            ? 'Start Processing'
                            : b.stage === 'processed'
                            ? 'Mark Packed'
                            : 'Dispatch Rations'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Redistributed</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Batch Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Initialize New FPU Processing Batch
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter raw surplus input and target shelf-stable output parameters.
            </p>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Raw Input Food Material *
                </label>
                <input
                  type="text"
                  required
                  value={rawMaterialName}
                  onChange={(e) => setRawMaterialName(e.target.value)}
                  placeholder="e.g. Surplus Ripe Farm Tomatoes, Seasonal Apples"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Input Weight (kg) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Shelf-Life Extension *
                  </label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value={90}>3 Months (90 days)</option>
                    <option value={180}>6 Months (180 days)</option>
                    <option value={365}>1 Year (365 days)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Finished Output Product *
                  </label>
                  <input
                    type="text"
                    required
                    value={outputProductName}
                    onChange={(e) => setOutputProductName(e.target.value)}
                    placeholder="e.g. Retort Tomato Puree Pouches"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Output Units Produced *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={outputQuantityUnits}
                    onChange={(e) => setOutputQuantityUnits(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Processing & Sterilization Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Autoclaved at 121°C for 20 mins. Nitrogen-flushed packaging."
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Register Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
