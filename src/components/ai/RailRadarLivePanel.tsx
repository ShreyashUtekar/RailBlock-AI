import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Sparkles, Loader2, Radio, MapPin, Clock, AlertTriangle, CheckCircle2, Navigation, Train } from 'lucide-react';
import { railwayService } from '../../services/railwayService';

interface RailRadarLivePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RailRadarLivePanel: React.FC<RailRadarLivePanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'live' | 'station'>('live');

  // Live Train State
  const [trainNo, setTrainNo] = useState<string>('12002');
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [liveData, setLiveData] = useState<any>(null);
  const [liveErr, setLiveErr] = useState<string | null>(null);

  // Station Board State
  const [stationCode, setStationCode] = useState<string>('TNA');
  const [isLoadingStation, setIsLoadingStation] = useState<boolean>(false);
  const [stationData, setStationData] = useState<any>(null);
  const [stationErr, setStationErr] = useState<string | null>(null);

  const handleFetchLive = async () => {
    if (!trainNo) return;
    setIsLoadingLive(true);
    setLiveErr(null);
    setLiveData(null);

    const res = await railwayService.fetchRailRadarLiveStatus(trainNo);
    setIsLoadingLive(false);

    if (res.success && res.data) {
      setLiveData(res.data);
    } else {
      setLiveErr(res.error || 'Failed to fetch live telemetry status from RailRadar API.');
    }
  };

  const handleFetchStation = async () => {
    if (!stationCode) return;
    setIsLoadingStation(true);
    setStationErr(null);
    setStationData(null);

    const res = await railwayService.fetchRailRadarStationTimetable(stationCode);
    setIsLoadingStation(false);

    if (res.success && res.data) {
      setStationData(res.data);
    } else {
      setStationErr(res.error || 'Failed to fetch station timetable from RailRadar API.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="RailRadar Live Telemetry & Radar Panel"
      subtitle="Real-time live train tracking, delay telemetry, and station boards via RailRadar API"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs text-slate-700">
        {/* Top Tab Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'live'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Train Running Status</span>
          </button>

          <button
            onClick={() => setActiveTab('station')}
            className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'station'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Station Timetable Board</span>
          </button>
        </div>

        {/* TAB 1: LIVE TRAIN RUNNING STATUS */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trainNo}
                onChange={(e) => setTrainNo(e.target.value)}
                placeholder="Enter 5-digit Train No (e.g. 12002, 12919, 12952)"
                className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-2 font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-600"
              />
              <button
                onClick={handleFetchLive}
                disabled={isLoadingLive}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold transition-colors disabled:opacity-50"
              >
                {isLoadingLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
                <span>Fetch Live Telemetry</span>
              </button>
            </div>

            {liveErr && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{liveErr}</span>
              </div>
            )}

            {liveData && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Train Status Banner */}
                <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-400 text-sm">
                          #{liveData.trainNumber || liveData.train?.number}
                        </span>
                        <h4 className="font-bold text-sm">{liveData.trainName || liveData.train?.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {liveData.train?.source?.name} ➔ {liveData.train?.destination?.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded font-extrabold text-xs border ${
                          liveData.delayMinutes > 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {liveData.delayMinutes > 0 ? `+${liveData.delayMinutes} mins Delay` : 'On Time'}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px]">Live Status</span>
                      <span className="font-bold text-emerald-400 capitalize">{liveData.status || 'Running'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px]">Speed</span>
                      <span className="font-bold text-blue-400">
                        {liveData.currentLocation?.speedKmh || liveData.train?.avgSpeed || 65} km/h
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px]">Next Halt</span>
                      <span className="font-bold text-slate-200">
                        {liveData.nextHalt?.stationName || 'Approaching Station'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exception Diversions Banner */}
                {liveData.exceptions && liveData.exceptions.length > 0 && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Route Diversion Notice:</span>
                    </div>
                    <p className="text-[11px] font-medium">{liveData.exceptions[0].message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STATION TIMETABLE BOARD */}
        {activeTab === 'station' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value.toUpperCase())}
                placeholder="Enter Station Code (e.g. TNA, VSH, PNVL, CSMT, KYN, NDLS)"
                className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-2 font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-600"
              />
              <button
                onClick={handleFetchStation}
                disabled={isLoadingStation}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold transition-colors disabled:opacity-50"
              >
                {isLoadingStation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Train className="w-4 h-4" />}
                <span>Fetch Station Board</span>
              </button>
            </div>

            {stationErr && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{stationErr}</span>
              </div>
            )}

            {stationData && stationData.trains && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span>Station: {stationData.station?.name} ({stationData.station?.code})</span>
                  <span className="text-xs font-mono text-blue-700">{stationData.trains.length} Scheduled Trains</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {stationData.trains.map((item: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">{item.train?.number}</span>
                          <span className="font-bold text-slate-900">{item.train?.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {item.train?.source?.code} ➔ {item.train?.destination?.code}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-900">{item.stop?.departure || item.stop?.arrival}</div>
                        <div className="text-[10px] text-slate-500">Platform {item.stop?.platform || '1'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
