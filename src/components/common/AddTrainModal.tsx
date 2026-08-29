import React, { useState } from 'react';
import { Modal } from './Modal';
import { Train, Plus, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AddTrainModal: React.FC = () => {
  const { isAddTrainModalOpen, setIsAddTrainModalOpen, addTrainMovement, corridors } = useApp();

  const [trainNumber, setTrainNumber] = useState<string>('99011');
  const [name, setName] = useState<string>('Thane - Panvel Sunday Special Local');
  const [type, setType] = useState<'Passenger' | 'Goods' | 'Express' | 'Superfast'>('Passenger');
  const [corridor, setCorridor] = useState<string>('THN–PNVL');
  const [departureTime, setDepartureTime] = useState<string>('12:15');
  const [arrivalTime, setArrivalTime] = useState<string>('13:05');
  const [kmFrom, setKmFrom] = useState<number>(0);
  const [kmTo, setKmTo] = useState<number>(38);

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
      title="Add Train Schedule (COA / FOIS Ingestion)"
      subtitle="Manually add suburban local, express, or freight train movements to corridor schedule"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-900 block mb-1">Train Number / Rake ID</label>
            <input
              type="text"
              required
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="e.g. 99011 or JNPT-9050"
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
              <option value="Superfast">Superfast Express / Rajdhani</option>
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
            placeholder="e.g. Thane - Panvel Fast Local"
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
            <label className="font-bold text-slate-900 block mb-1">Departure Time (COA)</label>
            <input
              type="time"
              required
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1">Arrival Time (COA)</label>
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
            <label className="font-bold text-slate-900 block mb-1">End Km</label>
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
    </Modal>
  );
};
