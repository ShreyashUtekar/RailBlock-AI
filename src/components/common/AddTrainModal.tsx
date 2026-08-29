import React, { useState } from 'react';
import { Modal } from './Modal';
import { Train, Plus, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { railwayService } from '../../services/railwayService';

export const AddTrainModal: React.FC = () => {
  const { isAddTrainModalOpen, setIsAddTrainModalOpen, addTrainMovement, corridors, showToast } = useApp();

  const [railradarSearchNo, setRailradarSearchNo] = useState<string>('12002');
  const [isFetchingRailradar, setIsFetchingRailradar] = useState<boolean>(false);
  const [railradarSuccessMsg, setRailradarSuccessMsg] = useState<string | null>(null);
  const [railradarErrMsg, setRailradarErrMsg] = useState<string | null>(null);

  const [trainNumber, setTrainNumber] = useState<string>('99011');
  const [name, setName] = useState<string>('Thane - Panvel Sunday Special Local');
  const [type, setType] = useState<'Passenger' | 'Goods' | 'Express' | 'Superfast'>('Passenger');
  const [corridor, setCorridor] = useState<string>('THN–PNVL');
  const [departureTime, setDepartureTime] = useState<string>('12:15');
  const [arrivalTime, setArrivalTime] = useState<string>('13:05');
  const [kmFrom, setKmFrom] = useState<number>(0);
  const [kmTo, setKmTo] = useState<number>(38);

  const handleRailradarFetch = async () => {
    if (!railradarSearchNo) return;
    setIsFetchingRailradar(true);
    setRailradarErrMsg(null);
    setRailradarSuccessMsg(null);

    const res = await railwayService.fetchRailRadarTrainSchedule(railradarSearchNo);
    setIsFetchingRailradar(false);

    if (res.success && res.train) {
      setTrainNumber(res.train.trainNumber);
      setName(res.train.name);
      setType(res.train.type);
      setDepartureTime(res.train.departureTime);
      setArrivalTime(res.train.arrivalTime);
      setKmFrom(res.train.kmFrom);
      setKmTo(res.train.kmTo);
      setRailradarSuccessMsg(`Successfully fetched live timetable for ${res.train.name}!`);
      showToast(`RailRadar API: Live schedule fetched for Train #${res.train.trainNumber}`);
    } else {
      setRailradarErrMsg(res.error || 'Failed to fetch train schedule from RailRadar API.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTrainMovement({
      trainNumber,
      name,
      type,
      corridor,
      departureTime,
      arrivalTime,
      kmFrom,
      kmTo,
    });
    setIsAddTrainModalOpen(false);
  };

  return (
    <Modal
      isOpen={isAddTrainModalOpen}
      onClose={() => setIsAddTrainModalOpen(false)}
      title="Add Train Schedule & Live RailRadar Integration"
      subtitle="Fetch real-time train timetables via RailRadar API or add manual train schedules"
    >
      <div className="space-y-4 text-xs text-slate-700">
        {/* RailRadar Live API Fetcher Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-lg p-3.5 space-y-2 border border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span>RailRadar Live API Timetable Fetcher</span>
            </div>
            <span className="text-[10px] font-mono bg-blue-800 text-blue-200 px-2 py-0.5 rounded border border-blue-600">
              Bearer rg_6f5b0...
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={railradarSearchNo}
              onChange={(e) => setRailradarSearchNo(e.target.value)}
              placeholder="Enter 5-digit Train No (e.g. 12002, 12919, 12952)"
              className="flex-1 bg-slate-950/80 border border-blue-600 rounded px-3 py-1.5 text-xs text-white font-mono placeholder-slate-400 focus:outline-none focus:border-blue-400"
            />
            <button
              type="button"
              disabled={isFetchingRailradar}
              onClick={handleRailradarFetch}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isFetchingRailradar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Auto-Fill from RailRadar</span>
            </button>
          </div>

          {railradarSuccessMsg && (
            <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {railradarSuccessMsg}
            </div>
          )}

          {railradarErrMsg && (
            <div className="text-[11px] text-red-300 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {railradarErrMsg}
            </div>
          )}
        </div>

        {/* Schedule Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Train Number / Rake ID</label>
              <input
                type="text"
                required
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="e.g. 12002 or JNPT-9050"
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono font-bold text-blue-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Train Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-semibold"
              >
                <option value="Passenger">Passenger / Suburban Local</option>
                <option value="Goods">Goods / Container Freight Rake</option>
                <option value="Express">Express Train</option>
                <option value="Superfast">Superfast Express / Rajdhani / Shatabdi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1">Train Name / Rake Description</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. New Delhi - Rani Kamlapati Shatabdi Express"
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1">Assigned Suburban Corridor</label>
            <select
              value={corridor}
              onChange={(e) => setCorridor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-semibold text-slate-800"
            >
              {corridors.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.from}–{c.to})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Departure Time (COA / RailRadar)</label>
              <input
                type="time"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Arrival Time (COA / RailRadar)</label>
              <input
                type="time"
                required
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Start Km</label>
              <input
                type="number"
                step="0.1"
                value={kmFrom}
                onChange={(e) => setKmFrom(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">End Km / Distance</label>
              <input
                type="number"
                step="0.1"
                value={kmTo}
                onChange={(e) => setKmTo(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddTrainModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Train Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
