import React from 'react';
import { Department, Criticality, Priority, TaskStatus, ConflictSeverity, BlockStatus, RiskLevel } from '../../types';

interface StatusBadgeProps {
  type: 'department' | 'criticality' | 'priority' | 'status' | 'conflict' | 'block' | 'risk';
  value: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'department') {
    switch (value as Department) {
      case 'Engineering':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
        break;
      case 'S&T':
        colorClasses = 'bg-blue-50 text-blue-800 border-blue-300 font-semibold';
        break;
      case 'Traction':
        colorClasses = 'bg-purple-50 text-purple-800 border-purple-300 font-semibold';
        break;
    }
  } else if (type === 'criticality') {
    switch (value as Criticality) {
      case 'Critical':
        colorClasses = 'bg-red-100 text-red-800 border-red-300 font-bold';
        break;
      case 'High':
        colorClasses = 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
        break;
      case 'Medium':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case 'Low':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  } else if (type === 'priority') {
    switch (value as Priority) {
      case 'P1':
        colorClasses = 'bg-red-600 text-white font-bold';
        break;
      case 'P2':
        colorClasses = 'bg-amber-600 text-white font-semibold';
        break;
      case 'P3':
        colorClasses = 'bg-blue-600 text-white font-medium';
        break;
      case 'P4':
        colorClasses = 'bg-slate-600 text-white font-medium';
        break;
    }
  } else if (type === 'status') {
    switch (value as TaskStatus) {
      case 'Recommended':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
        break;
      case 'Scheduled':
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
        break;
      case 'In Progress':
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 font-semibold animate-pulse';
        break;
      case 'Completed':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
      case 'Overdue':
        colorClasses = 'bg-red-100 text-red-800 border-red-300 font-bold';
        break;
      case 'Pending':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  } else if (type === 'conflict') {
    switch (value as ConflictSeverity) {
      case 'High':
        colorClasses = 'bg-red-100 text-red-800 border-red-300 font-bold';
        break;
      case 'Medium':
        colorClasses = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
        break;
      case 'Low':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  } else if (type === 'block') {
    switch (value as BlockStatus) {
      case 'Planned':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
        break;
      case 'Active':
        colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
        break;
      case 'Completed':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
      case 'Cancelled':
        colorClasses = 'bg-red-50 text-red-700 border-red-200';
        break;
    }
  } else if (type === 'risk') {
    switch (value as RiskLevel) {
      case 'Critical':
      case 'High':
        colorClasses = 'bg-red-50 text-red-700 border-red-200 font-bold';
        break;
      case 'Medium':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
        break;
      case 'Low':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border tracking-tight ${sizeClasses} ${colorClasses}`}
    >
      {value}
    </span>
  );
};
