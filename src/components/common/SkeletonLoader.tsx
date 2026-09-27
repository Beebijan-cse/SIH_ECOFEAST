import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />
);

export const SkeletonKPIGrid: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="w-8 h-8 rounded-lg bg-slate-200" />
        </div>
        <div className="h-8 w-28 bg-slate-200 rounded" />
        <div className="h-3 w-36 bg-slate-100 rounded" />
      </div>
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
    <div className="p-4 bg-slate-50 flex gap-4">
      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-16 bg-slate-200 rounded animate-pulse ml-auto" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
        <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-1/3 bg-slate-200 rounded" />
          <div className="h-3 w-1/4 bg-slate-100 rounded" />
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded" />
        <div className="h-8 w-24 bg-slate-200 rounded shrink-0" />
      </div>
    ))}
  </div>
);
