import React from 'react';
import { LucideIcon, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100/80 flex items-center justify-center mb-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mb-6 font-normal">
        {description}
      </p>

      {actionLabel && (
        actionTo ? (
          <Link
            to={actionTo}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{actionLabel}</span>
          </Link>
        ) : onAction ? (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{actionLabel}</span>
          </button>
        ) : null
      )}
    </div>
  );
};
