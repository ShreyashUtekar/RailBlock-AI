import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Settings as SettingsIcon, Sliders, ShieldCheck, Bell, Save, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Settings: React.FC = () => {
  const { showToast } = useApp();
  const [minBufferMinutes, setMinBufferMinutes] = useState<number>(15);
  const [maxBlockDuration, setMaxBlockDuration] = useState<number>(240);
  const [autoResolveConflicts, setAutoResolveConflicts] = useState<boolean>(true);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('System configuration & AI planning parameters saved successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="RailBlock System Settings & AI Configuration"
        subtitle="Configure Indian Railways division parameters, AI planning thresholds, and safety rules"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Planning Rules */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">AI Planning Engine Parameters</h3>
              <p className="text-xs text-slate-500">Tune optimization rules for block scheduling algorithms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Safety Buffer Time (Minutes)</label>
              <input
                type="number"
                value={minBufferMinutes}
                onChange={(e) => setMinBufferMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Minimum margin required between maintenance block end and train entry.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Maximum Block Duration (Minutes)</label>
              <input
                type="number"
                value={maxBlockDuration}
                onChange={(e) => setMaxBlockDuration(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Policy cap for maximum continuous track possession time (240m = 4h).
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Division & Section Control */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Railway Division Setup</h3>
              <p className="text-xs text-slate-500">Zonal and divisional operational jurisdiction</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Railway Zone</label>
              <input
                type="text"
                disabled
                value="Northern Railway (NR)"
                className="w-full bg-slate-100 border border-slate-300 rounded p-2 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Operating Division</label>
              <input
                type="text"
                disabled
                value="Delhi Division (DLI)"
                className="w-full bg-slate-100 border border-slate-300 rounded p-2 font-semibold text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-md shadow-xs transition-colors"
          >
            <Save className="w-4 h-4 text-blue-200" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
