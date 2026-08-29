import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Sparkles, Loader2, Radio, MapPin, Clock, AlertTriangle, CheckCircle2, Navigation, Train, Search, Compass } from 'lucide-react';
import { railwayService } from '../../services/railwayService';

interface RailRadarLivePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RailRadarLivePanel: React.FC<RailRadarLivePanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'live' | 'station' | 'local'>('live');

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

  // Suburban Local Lookup State
  const [selectedCity, setSelectedCity] = useState<string>('Mumbai');
  const [isLoadingLocal, setIsLoadingLocal] = useState<boolean>(false);
  const [localTrainsDict, setLocalTrainsDict] = useState<Record<string, string>>({});
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [localFilter, setLocalFilter] = useState<string>('');

  const handleFetchLive = async (trainToFetch?: string) => {
    const targetNo = trainToFetch || trainNo;
    if (!targetNo) return;
    if (trainToFetch) setTrainNo(trainToFetch);

    setIsLoadingLive(true);
    setLiveErr(null);
    setLiveData(null);

    const res = await railwayService.fetchRailRadarLiveStatus(targetNo);
    setIsLoadingLive(false);

    if (res.success && res.data) {
      setLiveData(res.data);
      if (trainToFetch) setActiveTab('live');
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

  const handleFetchLocalTrains = async (city: string) => {
    setIsLoadingLocal(true);
    setLocalErr(null);

    const res = await railwayService.fetchRailRadarLocalTrains(city);
    setIsLoadingLocal(false);

    if (res.success && res.data) {
      setLocalTrainsDict(res.data);
    } else {
      setLocalErr(res.error || 'Failed to fetch suburban local trains from RailRadar API.');
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'local' && Object.keys(localTrainsDict).length === 0) {
      handleFetchLocalTrains(selectedCity);
    }
  }, [isOpen, activeTab]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    handleFetchLocalTrains(city);
  };

  const localTrainEntries = Object.entries(localTrainsDict).filter(([no, name]) => {
    if (!localFilter) return true;
    const query = localFilter.toLowerCase();
    return no.toLowerCase().includes(query) || name.toLowerCase().includes(query);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="RailRadar Live Telemetry & Suburban Radar Panel"
      subtitle="Real-time live train tracking, delay telemetry, station boards, and city suburban local directories"
      maxWidth="3xl"
    >
      <div className="space-y-4 text-xs text-slate-700">
        {/* Top Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
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
            className={`px-3.5 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'station'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Station Timetable Board</span>
          </button>

          <button
            onClick={() => setActiveTab('local')}
            className={`px-3.5 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'local'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Suburban Local Directory ({Object.keys(localTrainsDict).length})</span>
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
                placeholder="Enter 5-digit Train No (e.g. 12002, 97001, 90001)"
                className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-2 font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-600"
              />
              <button
                onClick={() => handleFetchLive()}
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

        {/* TAB 3: SUBURBAN LOCAL TRAINS DIRECTORY (NEW!) */}
        {activeTab === 'local' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              {/* City Selection */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-xs">Select City:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 font-bold text-blue-700 focus:outline-none text-xs"
                >
                  <option value="Mumbai">Mumbai Suburban Railway</option>
                  <option value="Kolkata">Kolkata Suburban Railway</option>
                  <option value="Chennai">Chennai Suburban Railway</option>
                  <option value="Hyderabad">Hyderabad MMTS</option>
                </select>
              </div>

              {/* Live Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search local train no. or destination..."
                  value={localFilter}
                  onChange={(e) => setLocalFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {isLoadingLocal ? (
              <div className="p-8 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Loading {selectedCity} Suburban Local Trains from RailRadar API...</span>
              </div>
            ) : localErr ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{localErr}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
                  <span>Showing {localTrainEntries.length} Suburban Local Rakes for {selectedCity}</span>
                  <span className="font-mono text-blue-600">RailRadar /v1/lookup/trains/local</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {localTrainEntries.slice(0, 100).map(([number, name]) => (
                    <div
                      key={number}
                      className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded text-[11px]">
                            #{number}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Suburban Local Service</span>
                      </div>

                      <button
                        onClick={() => handleFetchLive(number)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-bold flex items-center gap-1"
                      >
                        <Radio className="w-3 h-3" />
                        <span>Live Status</span>
                      </button>
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
