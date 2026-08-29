import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { AIRecommendationCard } from '../components/ai/AIRecommendationCard';
import { ExplainabilityDrawer } from '../components/ai/ExplainabilityDrawer';
import { FilterBar } from '../components/common/FilterBar';
import { useApp } from '../context/AppContext';
import { Sparkles, Layers, ShieldCheck, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

export const AIRecommendations: React.FC = () => {
  const { recommendations, selectedCorridor, setIsOptimizationModalOpen } = useApp();

  const filteredRecs =
    selectedCorridor === 'All'
      ? recommendations
      : recommendations.filter((r) => r.corridor === selectedCorridor);

  const pendingCount = filteredRecs.filter((r) => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Block Optimization Proposals"
        subtitle="Automatic multi-department block recommendations with transparent explainability reasoning"
        actions={
          <button
            onClick={() => setIsOptimizationModalOpen(true)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs px-4 py-2 rounded-md shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Generate New AI Proposals</span>
          </button>
        }
      />

      <FilterBar showDepartmentFilter={false} showCriticalityFilter={false} />

      {/* Hero Comparison Banner: Traditional vs AI Coordinated Planning */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm border border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1 border-r border-slate-700/80 pr-4">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-400">
            <Layers className="w-4 h-4" />
            <span>Multi-Department Consolidation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            AI automatically merges track (TMS), signal (SMMS), and OHE (TDMS) tasks into a single shadow possession window.
          </p>
        </div>

        <div className="space-y-1 border-r border-slate-700/80 pr-4">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
            <Clock className="w-4 h-4" />
            <span>38% Downtime Reduction</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Average of 140 minutes saved per corridor per day by eliminating redundant track setup & clearance times.
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-purple-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Traffic Disruptions</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Avoids high-speed passenger expresses (Rajdhani/Shatabdi) and freight paths automatically.
          </p>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Pending AI Recommendations ({pendingCount})</span>
          </h2>
        </div>

        {filteredRecs.length > 0 ? (
          <div className="space-y-4">
            {filteredRecs.map((rec) => (
              <AIRecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500 text-xs">
            No pending AI recommendations for the selected filter.
          </div>
        )}
      </div>

      {/* Explainability Drawer */}
      <ExplainabilityDrawer />
    </div>
  );
};
