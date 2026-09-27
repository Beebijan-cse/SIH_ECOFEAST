import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShieldCheck,
  Zap,
  Truck,
  Leaf,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Factory,
  Globe2,
  HeartHandshake,
  ChevronRight,
  Shield,
  Layers,
  Thermometer,
  Building2,
  Check
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { AIAssistantModal } from '../../components/ai/AIAssistantModal';
import { dataService } from '../../services/dataService';
import { ImpactMetrics } from '../../types';

export const LandingPage: React.FC = () => {
  const [aiOpen, setAiOpen] = useState(false);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);

  useEffect(() => {
    dataService.getImpactMetrics().then(setImpact);
  }, []);

  // Section 6: 01 to 06 Clean Steps
  const howItWorksSteps = [
    {
      step: '01',
      title: 'Create Surplus',
      desc: 'Institutional kitchens log batch volume, prepared time, and storage temperature protocols.',
      icon: UtensilsCrossed
    },
    {
      step: '02',
      title: 'Verify Safety',
      desc: 'Digital HACCP probe test ensures food meets the strict 60°C hot-hold or 4°C cold-hold standard.',
      icon: ShieldCheck
    },
    {
      step: '03',
      title: 'Find Best Match',
      desc: 'Smart algorithm calculates distance, expiry urgency, intake capacity, and storage compatibility.',
      icon: Zap
    },
    {
      step: '04',
      title: 'Schedule Pickup',
      desc: 'Verified NGOs accept the match and dispatch volunteer drivers with thermal containers.',
      icon: Truck
    },
    {
      step: '05',
      title: 'Track Delivery',
      desc: 'Immutable digital chain-of-custody records handover from the kitchen kettle to the plate.',
      icon: Clock
    },
    {
      step: '06',
      title: 'Measure Impact',
      desc: 'Dynamic carbon models convert rescued kilograms into meals served and greenhouse gases avoided.',
      icon: Leaf
    }
  ];

  // Section 5: Feature cards (Smart Matching, Food Safety, Traceability, Digital Twin, Impact Analytics, AI Assistant)
  const featureCards = [
    {
      icon: Zap,
      title: 'Smart Matching',
      desc: 'Automated multi-factor algorithm scores local NGOs using Haversine distance, intake capacity, and storage compatibility.',
    },
    {
      icon: ShieldCheck,
      title: 'Food Safety',
      desc: 'Digital HACCP verification with automated 2-hour danger zone warning and 4-hour safety lockout safeguards every batch.',
    },
    {
      icon: Clock,
      title: 'Traceability',
      desc: 'End-to-end audit trail timestamps every handover from kitchen loading bay to beneficiary distribution point.',
    },
    {
      icon: Activity,
      title: 'Digital Twin',
      desc: 'Real-time ecosystem simulation tracks active inventory, kitchen sources, and logistics routing across the network.',
    },
    {
      icon: BarChart3,
      title: 'Impact Analytics',
      desc: 'Transparent peer-reviewed calculations quantify landfill methane cut, carbon offsets, and nutritious meals supported.',
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      desc: 'Server-side domain intelligence provides real-time guidance on FSSAI guidelines, temperature thresholds, and dispatch routes.',
    }
  ];

  // Section 4 Hero ecosystem: Kitchen → Safety → Smart Match → NGO → Pickup → Impact
  const ecosystemNodes = [
    {
      num: '1',
      name: 'Kitchen',
      title: 'Institutional Kitchen',
      detail: 'Surplus logged (35 kg Basmati Rice)',
      badge: 'GENERATED',
      icon: UtensilsCrossed,
      color: 'emerald'
    },
    {
      num: '2',
      name: 'Safety',
      title: 'Safety Verified',
      detail: 'HACCP probe tested (64°C Safe Hot-Hold)',
      badge: 'SAFE',
      icon: ShieldCheck,
      color: 'teal'
    },
    {
      num: '3',
      name: 'Smart Match',
      title: 'Smart Match Engine',
      detail: 'Haversine distance (4.8 km) + urgency score 94',
      badge: 'MATCHED',
      icon: Zap,
      color: 'blue'
    },
    {
      num: '4',
      name: 'NGO',
      title: 'Verified NGO Partner',
      detail: 'Robin Hood Army accepted dispatch',
      badge: 'ACCEPTED',
      icon: HeartHandshake,
      color: 'indigo'
    },
    {
      num: '5',
      name: 'Pickup',
      title: 'Thermal Pickup & Dispatch',
      detail: 'Driver en route with insulated hot-box cambros',
      badge: 'EN ROUTE',
      icon: Truck,
      color: 'amber'
    },
    {
      num: '6',
      name: 'Impact',
      title: 'Verified Social & Carbon Impact',
      detail: '88 community meals served · 88 kg CO₂ avoided',
      badge: 'RECORDED',
      icon: Leaf,
      color: 'forest'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar onOpenAI={() => setAiOpen(true)} />

      {/* Section 4: Hero Section with Side-by-Side Ecosystem Visual */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-white border-b border-slate-200/80">
        <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Smart Surplus Redistribution Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Turn Food Surplus Into <span className="text-emerald-600">Social Impact.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                EcoFeast connects kitchens, food processing units and NGOs to safely redistribute
                surplus food while reducing waste and measuring real-world impact.
              </p>

              {/* Two clear CTA buttons specified in Section 4 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Start Saving Food</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/impact"
                  className="px-6 py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200/60"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Explore Impact</span>
                </Link>
              </div>

              {/* Live Metric Strip */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Food Rescued</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans mt-0.5">
                    {impact ? `${impact.food_saved_kg.toLocaleString()} kg` : '18,450 kg'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Meals Served</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans mt-0.5">
                    {impact ? `${impact.meals_supported.toLocaleString()}` : '46,125'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">CO₂ Avoided</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans mt-0.5">
                    {impact ? `${impact.co2_saved_kg.toLocaleString()} kg` : '46,125 kg'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Ecosystem Visual: Kitchen -> Safety -> Smart Match -> NGO -> Pickup -> Impact */}
            <div className="lg:col-span-6">
              <div className="bg-slate-50/90 rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      EcoFeast Ecosystem Flow
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 font-medium px-2 py-0.5 rounded border border-emerald-200">
                    Live Autonomous Loop
                  </span>
                </div>

                {/* 6 Elegant Ecosystem Cards with Connecting Lines */}
                <div className="mt-3.5 space-y-2 relative">
                  {ecosystemNodes.map((node, idx) => {
                    const Icon = node.icon;
                    return (
                      <React.Fragment key={node.name}>
                        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-emerald-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold text-slate-400">0{node.num}</span>
                                <p className="text-xs font-bold text-slate-900 truncate">{node.title}</p>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{node.detail}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                            {node.badge}
                          </span>
                        </div>

                        {/* Subtle connecting line between nodes */}
                        {idx < ecosystemNodes.length - 1 && (
                          <div className="flex justify-center -my-1">
                            <div className="w-0.5 h-2.5 bg-emerald-300/80" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 6: How EcoFeast Works (01 - 06 clean visual flow) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              The 6-Step Closed Loop
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              How EcoFeast Works
            </h2>
            <p className="mt-2.5 text-sm text-slate-600 leading-relaxed font-normal">
              An automated, verified redistribution system ensuring rapid, hygienic, and transparent food recovery from kitchen to community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorksSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-extrabold text-slate-400">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Milestone {step.step}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Core Feature Cards */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Technology Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Engineered for Institutional Scale
            </h2>
            <p className="mt-2.5 text-sm text-slate-600 leading-relaxed font-normal">
              Every capability is designed to bridge the trust, safety, and coordination gap between food generators and relief organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Food Processing Unit (FPU) & Circular Economy Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Circular Food Upcycling
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Upcycling Perishables via Food Processing Units (FPUs)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Surplus raw ingredients, unblemished vegetables, and ripe fruits that cannot be eaten
                immediately are routed to local FPUs for retort pasteurization, solar dehydration, and packaging into 6-month shelf-stable relief rations.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Solar Dehydration</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Vegetable broth powders</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Retort Canning</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Fortified fruit spreads</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Vacuum Packing</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Extended shelf-life items</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50 rounded-xl p-6 border border-slate-200 text-left space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                FPU Pipeline Velocity
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-200/80">
                  <span className="text-slate-600">Surplus Upcycled</span>
                  <span className="font-bold text-slate-900 font-mono">3,200 kg</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/80">
                  <span className="text-slate-600">Relief Rations Created</span>
                  <span className="font-bold text-slate-900 font-mono">1,450 packs</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/80">
                  <span className="text-slate-600">Average Shelf Life Gain</span>
                  <span className="font-bold text-emerald-700 font-mono">+180 days</span>
                </div>
              </div>

              <Link
                to="/register"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                <span>Register as an FPU Partner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Join the EcoFeast Network
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Turn Kitchen Surplus Into Community Sustenance?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Institutional kitchens, food processing units, and food recovery NGOs can register in minutes to start coordinating verified, temperature-safe food transfers.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-400/20 transition-colors cursor-pointer"
            >
              Register Organization
            </Link>
            <Link
              to="/impact"
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-700"
            >
              View National Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">EcoFeast</span>
            <span>· Save Food. Connect Communities. Create Impact.</span>
          </div>
          <div>
            Smart India Hackathon (SIH 2026) · High-Fidelity Sustainability Platform
          </div>
        </div>
      </footer>

      {/* Server-Side AI Assistant Modal */}
      <AIAssistantModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
};
