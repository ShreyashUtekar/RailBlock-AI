import { maintenanceTasks as initialTasks } from '../data/maintenanceTasks';
import { maintenanceBlocks as initialBlocks } from '../data/blocks';
import { corridors as initialCorridors } from '../data/corridors';
import { conflicts as initialConflicts, trainMovements, systemIntegrations, aiRecommendations as initialRecommendations } from '../data/otherData';
import { MaintenanceTask, MaintenanceBlock, Corridor, Conflict, AIRecommendation, SystemIntegration } from '../types';
import { calculatePriorityScore } from '../utils/scoring';

class RailwayDataService {
  private tasks: MaintenanceTask[] = [...initialTasks];
  private blocks: MaintenanceBlock[] = [...initialBlocks];
  private corridors: Corridor[] = [...initialCorridors];
  private conflicts: Conflict[] = [...initialConflicts];
  private recommendations: AIRecommendation[] = [...initialRecommendations];
  private integrations: SystemIntegration[] = [...systemIntegrations];

  // ===== TASKS =====
  getTasks(): MaintenanceTask[] {
    return this.tasks;
  }

  getTaskById(id: string): MaintenanceTask | undefined {
    return this.tasks.find(t => t.id === id);
  }

  addTask(task: Omit<MaintenanceTask, 'id' | 'priorityScore'>): MaintenanceTask {
    const newTask: MaintenanceTask = {
      ...task,
      id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
      priorityScore: 0,
    };
    newTask.priorityScore = calculatePriorityScore(newTask);
    this.tasks.unshift(newTask);
    return newTask;
  }

  updateTaskStatus(id: string, status: MaintenanceTask['status'], recommendedBlock?: string): MaintenanceTask | null {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.tasks[idx] = {
        ...this.tasks[idx],
        status,
        ...(recommendedBlock ? { recommendedBlock } : {})
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
    return this.blocks.find(b => b.id === id);
  }

  createBlock(block: Omit<MaintenanceBlock, 'id'>): MaintenanceBlock {
    const newBlock: MaintenanceBlock = {
      ...block,
      id: `B-${Math.floor(220 + Math.random() * 80)}`,
    };
    this.blocks.unshift(newBlock);
    
    // Update task statuses
    block.tasks.forEach(taskId => {
      this.updateTaskStatus(taskId, 'Scheduled', `${newBlock.date} ${newBlock.startTime}–${newBlock.endTime}`);
    });

    return newBlock;
  }

  updateBlockStatus(id: string, status: MaintenanceBlock['status']): MaintenanceBlock | null {
    const idx = this.blocks.findIndex(b => b.id === id);
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
    return this.corridors.find(c => c.id === id);
  }

  // ===== CONFLICTS =====
  getConflicts(): Conflict[] {
    return this.conflicts;
  }

  resolveConflict(conflictId: string, solution?: string): boolean {
    const idx = this.conflicts.findIndex(c => c.id === conflictId);
    if (idx !== -1) {
      this.conflicts[idx] = {
        ...this.conflicts[idx],
        status: 'Resolved',
        ...(solution ? { aiSolution: solution } : {})
      };
      return true;
    }
    return false;
  }

  // ===== AI RECOMMENDATIONS =====
  getAIRecommendations(): AIRecommendation[] {
    return this.recommendations;
  }

  approveRecommendation(recId: string): MaintenanceBlock | null {
    const rec = this.recommendations.find(r => r.id === recId);
    if (rec) {
      rec.status = 'Approved';
      const timeStr = rec.suggestedTime || '01:30–04:30';
      const recTasks = rec.tasks || [];
      const newBlock = this.createBlock({
        date: rec.date || '2026-09-02',
        startTime: timeStr.split('–')[0] || '01:30',
        endTime: timeStr.split('–')[1] || '04:30',
        corridor: rec.corridor,
        kmFrom: recTasks[0]?.kmFrom || 145,
        kmTo: recTasks[recTasks.length - 1]?.kmTo || 148,
        departments: Array.from(new Set(recTasks.map(t => t.department))),
        tasks: recTasks.map(t => t.id),
        status: 'Planned',
        isCoordinated: rec.isCoordinated ?? true,
        suitabilityScore: rec.suitabilityScore,
        trainImpact: rec.trainImpact || 'Low',
      });
      return newBlock;
    }
    return null;
  }

  rejectRecommendation(recId: string): boolean {
    const rec = this.recommendations.find(r => r.id === recId);
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
    const newRecId = `REC-${Math.floor(100 + Math.random() * 900)}`;
    const newRec: AIRecommendation = {
      id: newRecId,
      corridor: params.corridor && params.corridor !== 'All' ? params.corridor : 'NDLS–PWL',
      suggestedTime: '02 Sep · 01:30–04:30',
      durationMinutes: 180,
      tasks: [
        this.tasks.find(t => t.id === 'TRK-1042') || this.tasks[0],
        this.tasks.find(t => t.id === 'SIG-2395') || this.tasks[1],
        this.tasks.find(t => t.id === 'TD-8835') || this.tasks[2]
      ],
      isCoordinated: true,
      suitabilityScore: 95,
      trainImpact: 'Low',
      efficiencyGain: '38% less track closure vs separate blocks',
      trainsAffected: 0,
      downtimeSavedMinutes: 140,
      conflictAvoided: 'Avoided Rajdhani #12952 (23:55) and Goods #58142 (05:00)',
      explanation: 'Consolidates critical track defect replacement (Engineering), signal cabling (S&T), and OHE insulator cleaning (Traction) into a single 3-hour window during zero-traffic hours.',
      status: 'Pending',
    };

    this.recommendations.unshift(newRec);

    return {
      generatedBlocks: 3,
      conflictsResolved: 4,
      suitabilityAvg: 92,
    };
  }
}

export const railwayService = new RailwayDataService();
