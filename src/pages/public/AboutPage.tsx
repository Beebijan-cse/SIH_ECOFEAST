import React from 'react';
import {
  Leaf,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Award,
  Globe2,
  Database,
  Lock,
  Cpu
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { AIAssistantModal } from '../../components/ai/AIAssistantModal';

export const AboutPage: React.FC = () => {
  const [aiOpen, setAiOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenAI={() => setAiOpen(true)} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Header */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Platform Whitepaper & Blueprint
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            About EcoFeast
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-3xl">
            EcoFeast is an AI-powered smart food surplus reduction, redistribution, safety verification,
            NGO matching, pickup coordination, traceability, and sustainability impact platform developed
            for institutional kitchens and food processing units.
          </p>
        </div>

        {/* The Problem & The Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-rose-600 mb-3">The Challenge (India & Global)</h3>
            <p className="text-xs text-slate-600 leading-relaxed space-y-2">
              Over <strong>68 million tonnes</strong> of food are wasted in India annually, while millions suffer from nutritional insecurity. Institutional kitchens (college hostels, hospitals, IT parks, banquet halls) prepare thousands of daily meals with unpredictable 10–25% surplus.
              <br /><br />
              Traditional donations fail because of:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600 list-disc list-inside">
              <li>Lack of verifiable digital food safety & temperature compliance</li>
              <li>Slow manual phone coordination while hot food deteriorates</li>
              <li>Zero real-time traceability or legal audit protection</li>
              <li>Absence of scientific impact measurement for ESG credits</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-emerald-600 mb-3">The EcoFeast Solution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              EcoFeast closes this gap by transforming institutional kitchens into automated food recovery nodes. We replace chaotic phone calls with a closed-loop system:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600 list-disc list-inside">
              <li><strong>Digital HACCP Station:</strong> Probe tests confirm safe holding zones (&gt;60°C or &lt;4°C) before food is ever listed.</li>
              <li><strong>Smart Matching Engine:</strong> Multi-factor algorithm optimizes distance, urgency, food category, and cold storage capacity.</li>
              <li><strong>Chain-of-Custody Traceability:</strong> Immutable audit ledger tracking timestamped handovers.</li>
              <li><strong>Digital Twin Ecosystem:</strong> Real-time macro-view of all food surplus flows in transit.</li>
            </ul>
          </div>
        </div>

        {/* Architecture & Tech Stack */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Technical Architecture</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase">Frontend Layer</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                React 19, TypeScript, Vite, Tailwind CSS 4, Lucide Icons, Recharts for dynamic visual telemetry, and React Router for role-protected navigation.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase">Data & Security</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                PostgreSQL with Supabase, Row Level Security (RLS) policies, UUID relations, index optimizations, and local fallback storage.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase">Server-Side AI</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Express backend powering Google GenAI SDK (Gemini 3.8 Flash) for interactive food safety guidance, with zero browser API key exposure.
              </p>
            </div>
          </div>
        </div>

        {/* UN SDGs */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">United Nations Sustainable Development Goals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 bg-amber-50/60 rounded-xl border border-amber-200/80">
              <span className="font-mono text-xs font-bold text-amber-700">SDG #2</span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">Zero Hunger</h4>
              <p className="text-xs text-slate-600 mt-1">
                Directing nutritious hot meals to shelters, orphanages, and disaster relief zones within hours of preparation.
              </p>
            </div>

            <div className="p-5 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
              <span className="font-mono text-xs font-bold text-emerald-700">SDG #12</span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">Responsible Consumption</h4>
              <p className="text-xs text-slate-600 mt-1">
                Equipping institutional kitchens with digital tools to identify excess production patterns and prevent waste at the source.
              </p>
            </div>

            <div className="p-5 bg-teal-50/60 rounded-xl border border-teal-200/80">
              <span className="font-mono text-xs font-bold text-teal-700">SDG #13</span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">Climate Action</h4>
              <p className="text-xs text-slate-600 mt-1">
                Diverting organic waste from anaerobic landfills, cutting potent methane greenhouse gas emissions.
              </p>
            </div>

          </div>
        </div>

      </main>

      <AIAssistantModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
};
