import { maintenanceTasks as initialTasks } from '../data/maintenanceTasks';
import { maintenanceBlocks as initialBlocks } from '../data/blocks';
import { corridors as initialCorridors } from '../data/corridors';
import { conflicts as initialConflicts, trainMovements, systemIntegrations, aiRecommendations as initialRecommendations } from '../data/otherData';
import { MaintenanceTask, MaintenanceBlock, Corridor, Conflict, AIRecommendation, SystemIntegration } from '../types';
import { calculatePriorityScore } from '../utils/scoring';

const API_BASE_URL = 'http://localhost:5000/api';

class RailwayDataService {
  private tasks: MaintenanceTask[] = [...initialTasks];
  private blocks: MaintenanceBlock[] = [...initialBlocks];
  private corridors: Corridor[] = [...initialCorridors];
  private conflicts: Conflict[] = [...initialConflicts];
  private recommendations: AIRecommendation[] = [...initialRecommendations];
  private integrations: SystemIntegration[] = [...systemIntegrations];
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
      const [tRes, bRes, cRes, cfRes, rRes] = await Promise.all([
        fetch(`${API_BASE_URL}/tasks`),
        fetch(`${API_BASE_URL}/blocks`),
        fetch(`${API_BASE_URL}/corridors`),
        fetch(`${API_BASE_URL}/conflicts`),
        fetch(`${API_BASE_URL}/recommendations`),
      ]);

      if (tRes.ok) this.tasks = await tRes.json();
      if (bRes.ok) this.blocks = await bRes.json();
      if (cRes.ok) this.corridors = await cRes.json();
      if (cfRes.ok) this.conflicts = await cfRes.json();
      if (rRes.ok) this.recommendations = await rRes.json();
    } catch (e) {
      console.warn('Failed to load data from PostgreSQL API:', e);
    }
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

  getTrainMovements() {
    return trainMovements;
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
