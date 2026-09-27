import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'emerald' | 'teal' | 'blue' | 'amber' | 'indigo' | 'forest';
  onClick?: () => void;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  accentColor = 'emerald',
  onClick,
  className = '',
}) => {
  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badgeBg: 'bg-emerald-50/80 text-emerald-800',
      cardHover: 'hover:border-emerald-300',
    },
    forest: {
      iconBg: 'bg-emerald-900/10 text-emerald-900 border-emerald-900/20',
      badgeBg: 'bg-emerald-900/10 text-emerald-900',
      cardHover: 'hover:border-emerald-600',
    },
    teal: {
      iconBg: 'bg-teal-50 text-teal-700 border-teal-100',
      badgeBg: 'bg-teal-50/80 text-teal-800',
      cardHover: 'hover:border-teal-300',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-700 border-blue-100',
      badgeBg: 'bg-blue-50/80 text-blue-800',
      cardHover: 'hover:border-blue-300',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
      badgeBg: 'bg-amber-50/80 text-amber-800',
      cardHover: 'hover:border-amber-300',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      badgeBg: 'bg-indigo-50/80 text-indigo-800',
      cardHover: 'hover:border-indigo-300',
    },
  };

  const scheme = colorMap[accentColor] || colorMap.emerald;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-all duration-200 flex flex-col justify-between ${
        onClick ? `cursor-pointer hover:shadow-md ${scheme.cardHover}` : ''
      } ${className}`}
    >
      <div>
        {/* Top Header: Small Icon & Short Label */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-xs font-semibold text-slate-500 tracking-tight">
            {label}
          </span>
          <div
            className={`w-8 h-8 rounded-lg ${scheme.iconBg} border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Large Metric Number */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            {value}
          </span>
        </div>
      </div>

      {/* Footer: Trend / Subtext */}
      {(trend || subtext) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100/90 flex items-center justify-between gap-2 text-xs">
          {trend ? (
            <span
              className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                trend.isPositive === true
                  ? 'text-emerald-700'
                  : trend.isPositive === false
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              {trend.isPositive === true ? (
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              ) : trend.isPositive === false ? (
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Minus className="w-3 h-3 shrink-0" />
              )}
              <span>{trend.value}</span>
            </span>
          ) : (
            <span />
          )}

          {subtext && (
            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[140px] text-right">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
