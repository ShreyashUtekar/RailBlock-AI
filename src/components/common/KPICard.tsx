import React, { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  icon: ReactNode;
  iconBgColor?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtext,
  icon,
  iconBgColor = 'bg-blue-50 text-blue-700',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
            {change && (
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  changeType === 'positive'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : changeType === 'negative'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {change}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-md ${iconBgColor}`}>{icon}</div>
      </div>

      {subtext && <p className="text-[11px] text-slate-500 mt-2.5 font-medium">{subtext}</p>}
    </div>
  );
};
