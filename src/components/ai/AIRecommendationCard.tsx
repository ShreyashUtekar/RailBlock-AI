import React from 'react';
import { Sparkles, Check, X, Info, Layers, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { AIRecommendation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useApp } from '../../context/AppContext';

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({ recommendation }) => {
  const { approveRecommendation, rejectRecommendation, setActiveExplainabilityRec } = useApp();
  const rec = recommendation;
  const recTasks = rec.tasks || [];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden">
      {/* Coordinated Indicator Tag */}
      {rec.isCoordinated && (
        <div className="bg-purple-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-b-md absolute top-0 right-4 flex items-center gap-1 shadow-xs">
          <Layers className="w-3 h-3" />
          <span>Multi-Department Coordinated</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-start justify-between pr-32">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{rec.corridor}</span>
              <span className="text-xs text-slate-500 font-mono">({rec.id})</span>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5 font-medium">
              <span className="flex items-center gap-1 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {rec.suggestedTime || rec.timeWindow}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-600">{rec.durationMinutes || 180} mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rationale Text */}
      <p className="text-xs text-slate-700 mt-3 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200/80 font-medium">
        {rec.explanation || rec.aiReasoning}
      </p>

      {/* Highlights & Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
        <div className="bg-blue-50/70 border border-blue-100 rounded p-2 text-center">
          <span className="text-[10px] uppercase font-bold text-blue-700 block">Suitability</span>
          <span className="text-base font-extrabold text-blue-900">{rec.suitabilityScore} / 100</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100 rounded p-2 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Train Impact</span>
          <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            {rec.trainImpact || 'Low'}
          </span>
        </div>

        <div className="bg-purple-50/70 border border-purple-100 rounded p-2 text-center">
          <span className="text-[10px] uppercase font-bold text-purple-700 block">Downtime Saved</span>
          <span className="text-xs font-bold text-purple-900">{rec.downtimeSavedMinutes || 140} mins</span>
        </div>

        <div className="bg-amber-50/70 border border-amber-100 rounded p-2 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Tasks Merged</span>
          <span className="text-xs font-bold text-amber-900">{recTasks.length} Maintenance Tasks</span>
        </div>
      </div>

      {/* Tasks Pill List */}
      {recTasks.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Tasks:</span>
          {recTasks.map((task) => (
            <div
              key={task.id}
              className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono"
            >
              <span className="font-bold">{task.id}</span>
              <StatusBadge type="department" value={task.department} size="sm" />
              <span className="text-slate-500">({task.estimatedDuration}m)</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200">
        <button
          onClick={() => setActiveExplainabilityRec(rec)}
          className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Explain Recommendation & Trade-offs</span>
        </button>

        <div className="flex items-center gap-2">
          {rec.status === 'Pending' ? (
            <>
              <button
                onClick={() => rejectRecommendation(rec.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>Dismiss</span>
              </button>
              <button
                onClick={() => approveRecommendation(rec.id)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-blue-200" />
                <span>Approve & Schedule</span>
              </button>
            </>
          ) : (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded border ${
                rec.status === 'Approved'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              {rec.status || 'Pending'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
