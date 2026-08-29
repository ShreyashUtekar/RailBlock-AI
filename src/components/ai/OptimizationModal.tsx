import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Sparkles, Sliders, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OptimizationModal: React.FC = () => {
  const { isOptimizationModalOpen, setIsOptimizationModalOpen, runAIOptimization, corridors } = useApp();

  const [selectedCorridor, setSelectedCorridor] = useState<string>('All');
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [weightSafety, setWeightSafety] = useState<number>(40);
  const [weightTraffic, setWeightTraffic] = useState<number>(35);
  const [weightCoordination, setWeightCoordination] = useState<number>(25);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<string>('');

  const handleRun = () => {
    setIsSimulating(true);

    const steps = [
      'Reading track defect logs from TMS & signalling tasks from SMMS...',
      'Injesting live FOIS freight schedule & train timetables...',
      'Computing multi-department shadow corridor availability windows...',
      'Solving multi-objective conflict optimization matrix...',
      'Finalizing high-suitability block schedule recommendations...',
    ];

    let i = 0;
    setSimulationStep(steps[0]);

    const interval = setInterval(() => {
      i++;
      if (i < steps.length) {
        setSimulationStep(steps[i]);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        runAIOptimization({ corridor: selectedCorridor, timeHorizonDays: horizonDays });
        setIsOptimizationModalOpen(false);
      }
    }, 700);
  };

  return (
    <Modal
      isOpen={isOptimizationModalOpen}
      onClose={() => !isSimulating && setIsOptimizationModalOpen(false)}
      title="Generate AI Automatic Block Schedule"
      subtitle="AI Optimization Engine for Indian Railways maintenance planning"
      maxWidth="lg"
    >
      {isSimulating ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-blue-700 animate-spin">
            <Loader2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Running Optimization Algorithm...</h4>
            <p className="text-xs text-blue-700 font-mono mt-1 animate-pulse">{simulationStep}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5 text-xs text-slate-700">
          {/* Corridor Selection */}
          <div>
            <label className="font-bold text-slate-900 block mb-1">Target Corridor</label>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 font-medium text-slate-800 focus:ring-1 focus:ring-blue-600"
            >
              <option value="All">All Northern Railway Division Corridors (8)</option>
              {corridors.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.from}–{c.to})
                </option>
              ))}
            </select>
          </div>

          {/* Time Horizon Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-900">Planning Time Horizon</label>
              <span className="font-mono font-bold text-blue-700">{horizonDays} Days</span>
            </div>
            <input
              type="range"
              min={1}
              max={14}
              value={horizonDays}
              onChange={(e) => setHorizonDays(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Optimization Priority Weight Distribution */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Multi-Objective Scoring Weights</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-600">Track Safety & Overdue Criticality</span>
                <span className="font-mono font-bold">{weightSafety}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={70}
                value={weightSafety}
                onChange={(e) => setWeightSafety(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-600">Train Delay Minimization</span>
                <span className="font-mono font-bold">{weightTraffic}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={70}
                value={weightTraffic}
                onChange={(e) => setWeightTraffic(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-600">Multi-Department Consolidation</span>
                <span className="font-mono font-bold">{weightCoordination}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={70}
                value={weightCoordination}
                onChange={(e) => setWeightCoordination(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsOptimizationModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-md font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRun}
              className="flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-semibold shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Run AI Schedule Generator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
