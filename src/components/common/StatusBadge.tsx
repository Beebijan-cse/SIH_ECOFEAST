import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Truck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { SafetyStatus, PickupStatus, PickupWorkflowStatus } from '../../types';

interface StatusBadgeProps {
  status: SafetyStatus | PickupStatus | PickupWorkflowStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md'
}) => {
  const normalized = (status || '').toLowerCase().trim();

  let label = status;
  let bgClass = 'bg-slate-50 text-slate-700 border-slate-200';
  let dotClass = 'bg-slate-400';
  let Icon: React.ComponentType<{ className?: string }> | null = null;

  switch (normalized) {
    // 1. SAFE
    case 'safe':
      label = 'SAFE';
      bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotClass = 'bg-emerald-500';
      Icon = ShieldCheck;
      break;

    // 2. PENDING
    case 'pending':
    case 'pending check':
      label = 'PENDING';
      bgClass = 'bg-amber-50 text-amber-800 border-amber-200';
      dotClass = 'bg-amber-500 animate-pulse';
      Icon = Clock;
      break;

    // 3. UNSAFE
    case 'unsafe':
      label = 'UNSAFE';
      bgClass = 'bg-rose-50 text-rose-800 border-rose-200';
      dotClass = 'bg-rose-500';
      Icon = XCircle;
      break;

    // 4. EXPIRED
    case 'expired':
      label = 'EXPIRED';
      bgClass = 'bg-slate-100 text-slate-600 border-slate-300';
      dotClass = 'bg-slate-400';
      Icon = AlertTriangle;
      break;

    // 5. MATCHED
    case 'matched':
      label = 'MATCHED';
      bgClass = 'bg-blue-50 text-blue-800 border-blue-200';
      dotClass = 'bg-blue-500';
      Icon = RefreshCw;
      break;

    // 6. AVAILABLE
    case 'available':
      label = 'AVAILABLE';
      bgClass = 'bg-teal-50 text-teal-800 border-teal-200';
      dotClass = 'bg-teal-500';
      Icon = CheckCircle2;
      break;

    // 7. SCHEDULED
    case 'scheduled':
      label = 'SCHEDULED';
      bgClass = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      dotClass = 'bg-indigo-500';
      Icon = Clock;
      break;

    // 8. COMPLETED (and allied delivered states)
    case 'completed':
    case 'delivered':
      label = 'COMPLETED';
      bgClass = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold';
      dotClass = 'bg-emerald-600';
      Icon = CheckCircle2;
      break;

    // In-transit workflows
    case 'in_progress':
    case 'picked_up':
      label = 'EN ROUTE';
      bgClass = 'bg-amber-50 text-amber-900 border-amber-200';
      dotClass = 'bg-amber-500 animate-pulse';
      Icon = Truck;
      break;

    case 'cancelled':
    case 'rejected':
      label = 'CANCELLED';
      bgClass = 'bg-slate-100 text-slate-600 border-slate-200';
      dotClass = 'bg-slate-400';
      Icon = XCircle;
      break;

    default:
      label = status.toUpperCase();
      bgClass = 'bg-slate-50 text-slate-700 border-slate-200';
      dotClass = 'bg-slate-400';
  }

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium tracking-wide rounded-md border font-mono ${
        isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${bgClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      {Icon && <Icon className={`shrink-0 ${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />}
      <span>{label}</span>
    </span>
  );
};
