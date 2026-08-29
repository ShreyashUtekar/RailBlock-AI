import { maintenanceTasks as initialTasks } from '../data/maintenanceTasks';
import { maintenanceBlocks as initialBlocks } from '../data/blocks';
import { corridors as initialCorridors } from '../data/corridors';
import { conflicts as initialConflicts, trainMovements as initialTrains, systemIntegrations, aiRecommendations as initialRecommendations } from '../data/otherData';
import { MaintenanceTask, MaintenanceBlock, Corridor, Conflict, AIRecommendation, SystemIntegration, TrainMovement } from '../types';
import { calculatePriorityScore } from '../utils/scoring';

const API_BASE_URL = 'http://localhost:5000/api';
const RAILRADAR_DIRECT_KEY = 'rg_6f5b04ffd8a24b1ab02a424b72cb5b67';

class RailwayDataService {
  private tasks: MaintenanceTask[] = [...initialTasks];
  private blocks: MaintenanceBlock[] = [...initialBlocks];
  private corridors: Corridor[] = [...initialCorridors];
  private conflicts: Conflict[] = [...initialConflicts];
  private recommendations: AIRecommendation[] = [...initialRecommendations];
  private integrations: SystemIntegration[] = [...systemIntegrations];
  private trains: TrainMovement[] = [...initialTrains];
  private isPostgresConnected: boolean = false;

  constructor() {
    this.checkPostgresConnection();
  }

  private async checkPostgresConnection() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        if (data.database?.connected) {
          this.isPostgresConnected = true;
          console.log('RailBlock AI Frontend connected to PostgreSQL Express Backend!');
          this.loadPostgresData();
        }
      }
    } catch (e) {
      console.log('PostgreSQL backend server offline. Using local in-memory dataset.');
      this.isPostgresConnected = false;
    }
  }

  private async loadPostgresData() {
    try {
      const [tRes, bRes, cRes, cfRes, rRes, trRes] = await Promise.all([
        fetch(`${API_BASE_URL}/tasks`),
        fetch(`${API_BASE_URL}/blocks`),
        fetch(`${API_BASE_URL}/corridors`),
        fetch(`${API_BASE_URL}/conflicts`),
        fetch(`${API_BASE_URL}/recommendations`),
        fetch(`${API_BASE_URL}/trains`).catch(() => null),
      ]);

      if (tRes.ok) this.tasks = await tRes.json();
      if (bRes.ok) this.blocks = await bRes.json();
      if (cRes.ok) this.corridors = await cRes.json();
      if (cfRes.ok) this.conflicts = await cfRes.json();
      if (rRes.ok) this.recommendations = await rRes.json();
      if (trRes && trRes.ok) this.trains = await trRes.json();
    } catch (e) {
      console.warn('Failed to load data from PostgreSQL API:', e);
    }
  }

  // ===== RAILRADAR API 1: TRAIN TIMETABLE & SCHEDULE =====
  async fetchRailRadarTrainSchedule(trainNumber: string): Promise<{
    success: boolean;
    train?: TrainMovement;
    raw?: any;
    error?: string;
  }> {
    try {
      let data: any;

      try {
        const res = await fetch(`${API_BASE_URL}/railradar/train/${trainNumber}?haltsOnly=true`);
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {}

      if (!data) {
        const res = await fetch(`https://api.railradar.in/v1/trains/${trainNumber}?haltsOnly=true`, {
          headers: { 'Authorization': `Bearer ${RAILRADAR_DIRECT_KEY}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error?.message || `RailRadar returned status ${res.status}` };
        }
        data = await res.json();
      }

      if (data && data.success && data.data?.train) {
        const tr = data.data.train;
        const route = data.data.route || [];

        const departureTime = route[0]?.departure || '06:00';
        const arrivalTime = route[route.length - 1]?.arrival || '14:40';

        let categoryMapped: TrainMovement['type'] = 'Express';
        if (tr.category === 'Superfast' || tr.type?.includes('Shatabdi') || tr.type?.includes('Rajdhani')) {
          categoryMapped = 'Superfast';
        } else if (tr.category === 'Suburban' || tr.category === 'Local' || tr.type?.includes('Local')) {
          categoryMapped = 'Passenger';
        } else if (tr.category === 'Freight' || tr.category === 'Goods') {
          categoryMapped = 'Goods';
        }

        const newTrain: TrainMovement = {
          id: `T-RR-${tr.number}`,
          trainNumber: tr.number,
          name: `${tr.name} (${tr.source?.code} ➔ ${tr.destination?.code})`,
          type: categoryMapped,
          corridor: 'CSMT–KYN (Fast)',
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          kmFrom: 0,
          kmTo: tr.distance || 50,
        };

        this.addTrainMovement(newTrain);

        return {
          success: true,
          train: newTrain,
          raw: data.data,
        };
      }

      return { success: false, error: 'Train schedule not found' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error reaching RailRadar API' };
    }
  }

  // ===== RAILRADAR API 2: LIVE RUNNING STATUS & TELEMETRY =====
  async fetchRailRadarLiveStatus(trainNumber: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      let data: any;

      try {
        const res = await fetch(`${API_BASE_URL}/railradar/train/${trainNumber}/live`);
        if (res.ok) data = await res.json();
      } catch (err) {}

      if (!data) {
        const res = await fetch(`https://api.railradar.in/v1/trains/${trainNumber}/live`, {
          headers: { 'Authorization': `Bearer ${RAILRADAR_DIRECT_KEY}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error?.message || `RailRadar returned status ${res.status}` };
        }
        data = await res.json();
      }

      if (data && data.success) {
        return { success: true, data: data.data };
      }

      return { success: false, error: 'Live status telemetry unavailable for this train run' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error reaching RailRadar Live API' };
    }
  }

  // ===== RAILRADAR API 3: STATION TIMETABLE BOARD =====
  async fetchRailRadarStationTimetable(stationCode: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      let data: any;

      try {
        const res = await fetch(`${API_BASE_URL}/railradar/station/${stationCode}/trains`);
        if (res.ok) data = await res.json();
      } catch (err) {}

      if (!data) {
        const res = await fetch(`https://api.railradar.in/v1/stations/${stationCode}/trains`, {
          headers: { 'Authorization': `Bearer ${RAILRADAR_DIRECT_KEY}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error?.message || `RailRadar returned status ${res.status}` };
        }
        data = await res.json();
      }

      if (data && data.success) {
        return { success: true, data: data.data };
      }

      return { success: false, error: 'Station timetable unavailable' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error reaching RailRadar Station API' };
    }
  }

  // ===== RAILRADAR API 4: SUBURBAN LOCAL TRAINS LOOKUP =====
  async fetchRailRadarLocalTrains(city: string = 'Mumbai'): Promise<{
    success: boolean;
    data?: Record<string, string>;
    error?: string;
  }> {
    try {
      let data: any;

      try {
        const res = await fetch(`${API_BASE_URL}/railradar/lookup/trains/local?city=${encodeURIComponent(city)}`);
        if (res.ok) data = await res.json();
      } catch (err) {}

      if (!data) {
        const res = await fetch(`https://api.railradar.in/v1/lookup/trains/local?city=${encodeURIComponent(city)}`, {
          headers: { 'Authorization': `Bearer ${RAILRADAR_DIRECT_KEY}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error?.message || `RailRadar returned status ${res.status}` };
        }
        data = await res.json();
      }

      if (data && data.success && data.data) {
        return { success: true, data: data.data };
      }

      return { success: false, error: 'Suburban local trains data unavailable' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error reaching RailRadar Lookup API' };
    }
  }

  // ===== TRAIN MOVEMENTS =====
  getTrainMovements(): TrainMovement[] {
    return this.trains;
  }

  addTrainMovement(train: TrainMovement | Omit<TrainMovement, 'id'>): TrainMovement {
    const existingIdx = this.trains.findIndex((t) => t.trainNumber === train.trainNumber);
    const newTrain: TrainMovement = {
      ...train,
      id: 'id' in train ? train.id : `T-MH-${Math.floor(100 + Math.random() * 900)}`,
    };

    if (existingIdx !== -1) {
      this.trains[existingIdx] = newTrain;
    } else {
      this.trains.unshift(newTrain);
    }

    if (this.isPostgresConnected) {
      fetch(`${API_BASE_URL}/trains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrain),
      }).catch(console.warn);
    }

    return newTrain;
  }

  // ===== TASKS =====
  getTasks(): MaintenanceTask[] {
    return this.tasks;
  }

  getTaskById(id: string): MaintenanceTask | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  addTask(task: Omit<MaintenanceTask, 'id' | 'priorityScore'>): MaintenanceTask {
    const newTask: MaintenanceTask = {
      ...task,
      id: `TASK-MH-${Math.floor(100 + Math.random() * 900)}`,
      priorityScore: 0,
    };
    newTask.priorityScore = calculatePriorityScore(newTask);
    this.tasks.unshift(newTask);

    if (this.isPostgresConnected) {
      fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      }).catch(console.warn);
    }

    return newTask;
  }

  updateTaskStatus(id: string, status: MaintenanceTask['status'], recommendedBlock?: string): MaintenanceTask | null {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.tasks[idx] = {
        ...this.tasks[idx],
        status,
        ...(recommendedBlock ? { recommendedBlock } : {}),
      };
      return this.tasks[idx];
    }
    return null;
  }

  // ===== BLOCKS =====
  getBlocks(): MaintenanceBlock[] {
    return this.blocks;
  }

  getBlockById(id: string): MaintenanceBlock | undefined {
    return this.blocks.find((b) => b.id === id);
  }

  createBlock(block: Omit<MaintenanceBlock, 'id'>): MaintenanceBlock {
    const newBlock: MaintenanceBlock = {
      ...block,
      id: `MB-THN-${Math.floor(500 + Math.random() * 500)}`,
    };
    this.blocks.unshift(newBlock);

    block.tasks.forEach((taskId) => {
      this.updateTaskStatus(taskId, 'Scheduled', `${newBlock.date} ${newBlock.startTime}–${newBlock.endTime}`);
    });

    if (this.isPostgresConnected) {
      fetch(`${API_BASE_URL}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlock),
      }).catch(console.warn);
    }

    return newBlock;
  }

  updateBlockStatus(id: string, status: MaintenanceBlock['status']): MaintenanceBlock | null {
    const idx = this.blocks.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.blocks[idx] = { ...this.blocks[idx], status };
      return this.blocks[idx];
    }
    return null;
  }

  // ===== CORRIDORS =====
  getCorridors(): Corridor[] {
    return this.corridors;
  }

  getCorridorById(id: string): Corridor | undefined {
    return this.corridors.find((c) => c.id === id);
  }

  // ===== CONFLICTS =====
  getConflicts(): Conflict[] {
    return this.conflicts;
  }

  resolveConflict(conflictId: string, solution?: string): boolean {
    const idx = this.conflicts.findIndex((c) => c.id === conflictId);
    if (idx !== -1) {
      this.conflicts[idx] = {
        ...this.conflicts[idx],
        status: 'Resolved',
        ...(solution ? { aiSolution: solution } : {}),
      };

      if (this.isPostgresConnected) {
        fetch(`${API_BASE_URL}/conflicts/${conflictId}/resolve`, { method: 'POST' }).catch(console.warn);
      }

      return true;
    }
    return false;
  }

  // ===== AI RECOMMENDATIONS =====
  getAIRecommendations(): AIRecommendation[] {
    return this.recommendations;
  }

  approveRecommendation(recId: string): MaintenanceBlock | null {
    const rec = this.recommendations.find((r) => r.id === recId);
    if (rec) {
      rec.status = 'Approved';
      const timeStr = rec.suggestedTime || '11:05–16:05';
      const recTasks = rec.tasks || [];
      const newBlock = this.createBlock({
        date: rec.date || '2026-09-06',
        startTime: timeStr.split('–')[0] || '11:05',
        endTime: timeStr.split('–')[1] || '16:05',
        corridor: rec.corridor,
        kmFrom: recTasks[0]?.kmFrom || 4.0,
        kmTo: recTasks[recTasks.length - 1]?.kmTo || 18.2,
        departments: Array.from(new Set(recTasks.map((t) => t.department))),
        tasks: recTasks.map((t) => t.id),
        status: 'Planned',
        isCoordinated: rec.isCoordinated ?? true,
        suitabilityScore: rec.suitabilityScore,
        trainImpact: rec.trainImpact || 'Medium',
      });
      return newBlock;
    }
    return null;
  }

  rejectRecommendation(recId: string): boolean {
    const rec = this.recommendations.find((r) => r.id === recId);
    if (rec) {
      rec.status = 'Rejected';
      return true;
    }
    return false;
  }

  // ===== SYSTEM INTEGRATIONS =====
  getIntegrations(): SystemIntegration[] {
    return this.integrations;
  }

  // ===== SIMULATE AI GENERATION =====
  generateNewPlan(params: { corridor?: string; timeHorizonDays?: number }): { generatedBlocks: number; conflictsResolved: number; suitabilityAvg: number } {
    const newRecId = `REC-MH-${Math.floor(100 + Math.random() * 900)}`;
    const newRec: AIRecommendation = {
      id: newRecId,
      corridor: params.corridor && params.corridor !== 'All' ? params.corridor : 'THN–VSH',
      suggestedTime: '06 Sep · 11:05–16:05',
      durationMinutes: 300,
      tasks: [
        this.tasks.find((t) => t.id === 'TRK-MH-201') || this.tasks[0],
        this.tasks.find((t) => t.id === 'SIG-MH-405') || this.tasks[1],
        this.tasks.find((t) => t.id === 'TD-MH-802') || this.tasks[2],
      ],
      isCoordinated: true,
      suitabilityScore: 96,
      trainImpact: 'Medium',
      efficiencyGain: 'Sunday passenger commuter traffic is 48% lower; saves 5.5 hours track closure time',
      trainsAffected: 12,
      downtimeSavedMinutes: 330,
      conflictAvoided: 'Avoided weekday peak commuter rush (3m headway); diverted JNPT container freight via Kopar bypass',
      explanation: 'Trans-Harbour Sunday Mega Block proposal: Consolidates Rail flaw replacement (Rabale–Kopar Khairane), Digital Axle Counter testing (Turbhe Yard), and OHE Insulator Washing (Airoli–Ghansoli) into a single 5-hour shadow possession.',
      status: 'Pending',
    };

    this.recommendations.unshift(newRec);

    return {
      generatedBlocks: 3,
      conflictsResolved: 4,
      suitabilityAvg: 96,
    };
  }
}

export const railwayService = new RailwayDataService();
