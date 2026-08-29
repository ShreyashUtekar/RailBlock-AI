// ============================================================
// RailBlock AI — TypeScript Type Definitions
// ============================================================

export type Department = 'Engineering' | 'S&T' | 'Traction';
export type Criticality = 'Critical' | 'High' | 'Medium' | 'Low';
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type TaskStatus = 'Recommended' | 'Pending' | 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
export type ConflictSeverity = 'High' | 'Medium' | 'Low';
export type SystemStatus = 'Connected' | 'Disconnected' | 'Syncing' | 'Error';
export type BlockStatus = 'Planned' | 'Active' | 'Completed' | 'Cancelled';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface MaintenanceTask {
  id: string;
  department: Department;
  asset: string;
  assetType: string;
  location: string;
  kmFrom: number;
  kmTo: number;
  corridor: string;
  issue: string;
  maintenanceType: string;
  criticality: Criticality;
  priority: Priority;
  priorityScore: number;
  dueDate: string;
  estimatedDuration: number; // minutes
  status: TaskStatus;
  recommendedBlock?: string;
  safetyImpact: number;       // 1-5
  failureRisk: number;        // 0-1 probability
  overdueDays: number;
}

export interface MaintenanceBlock {
  id: string;
  date: string;
  startTime: string;       // HH:mm
  endTime: string;         // HH:mm
  corridor: string;
  kmFrom: number;
  kmTo: number;
  departments: Department[];
  tasks: string[];          // task IDs
  status: BlockStatus;
  isCoordinated: boolean;
  suitabilityScore: number;
  trainImpact: 'None' | 'Low' | 'Medium' | 'High';
}

export interface Corridor {
  id: string;
  name: string;
  from: string;
  to: string;
  totalKm: number;
  availableHours: number;
  trainDensity: 'Low' | 'Medium' | 'High';
  plannedBlocks: number;
  availableCapacity: number; // percentage
  risk: RiskLevel;
  timeSlots: CorridorTimeSlot[];
}

export interface CorridorTimeSlot {
  startHour: number;
  endHour: number;
  type: 'available' | 'train-occupied' | 'maintenance' | 'restricted';
  label?: string;
}

export interface TrainMovement {
  id: string;
  trainNumber: string;
  name: string;
  type: 'Passenger' | 'Goods' | 'Express' | 'Superfast';
  corridor: string;
  departureTime: string;
  arrivalTime: string;
  kmFrom: number;
  kmTo: number;
}

export interface Conflict {
  id: string;
  severity: ConflictSeverity;
  description: string;
  location: string;
  kmRange: string;
  currentBlock: string;
  conflictWith: string;
  conflictTime: string;
  aiSolution: string;
  expectedImpact: string;
  impactReduction: number; // percentage
  status: 'Open' | 'Resolved' | 'Dismissed';
  relatedBlockId?: string;
  relatedTrainId?: string;
}

export interface SystemIntegration {
  id: string;
  name: string;
  fullName: string;
  department?: string;
  status: SystemStatus;
  endpoint?: string;
  lastSync: string;
  recordsCount?: number;
  records?: number;
  description: string;
  accuracy?: number;
}

export interface ScoreBreakdown {
  maintenanceUrgency?: { score: number; max: number };
  assetCriticality?: { score: number; max: number };
  trainTrafficImpact?: { score: number; max: number };
  multiDeptCoordination?: { score: number; max: number };
  historicalEfficiency?: { score: number; max: number };
}

export interface AIRecommendation {
  id: string;
  corridor: string;
  suggestedTime?: string;
  durationMinutes?: number;
  tasks?: MaintenanceTask[];
  isCoordinated?: boolean;
  suitabilityScore: number;
  trainImpact?: 'None' | 'Low' | 'Medium' | 'High';
  efficiencyGain?: string;
  trainsAffected?: number;
  downtimeSavedMinutes?: number;
  conflictAvoided?: string;
  explanation?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  blockId?: string;
  date?: string;
  timeWindow?: string;
  reasons?: string[];
  assetAvailability?: number;
  trainDisruption?: 'None' | 'Low' | 'Medium' | 'High';
  tasksConsolidated?: number;
  departments?: Department[];
  scoreBreakdown?: ScoreBreakdown;
  aiReasoning?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}
