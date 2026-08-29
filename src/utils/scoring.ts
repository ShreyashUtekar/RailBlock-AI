import { MaintenanceTask, Criticality } from '../types';

/**
 * Calculate maintenance priority score (0-100)
 * 
 * Score = CriticalityWeight + UrgencyWeight + SafetyRisk + OverdueFactor + FailureRisk
 */
export function calculatePriorityScore(task: MaintenanceTask): number {
  const criticalityMap: Record<Criticality, number> = {
    'Critical': 25,
    'High': 20,
    'Medium': 12,
    'Low': 5,
  };

  const criticalityScore = criticalityMap[task.criticality];

  // Urgency: inverse of days until deadline (max 25)
  const now = new Date('2026-08-29');
  const due = new Date(task.dueDate);
  const daysUntilDue = Math.max(0, Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const urgencyScore = Math.min(25, Math.max(0, 25 - daysUntilDue * 1.5));

  // Safety impact (0-20)
  const safetyScore = task.safetyImpact * 4;

  // Overdue factor (0-15)
  const overdueScore = Math.min(15, task.overdueDays * 3);

  // Failure risk (0-15)
  const failureScore = Math.round(task.failureRisk * 15);

  return Math.min(100, Math.round(criticalityScore + urgencyScore + safetyScore + overdueScore + failureScore));
}

/**
 * Calculate block suitability score (0-100)
 */
export function calculateBlockSuitability(params: {
  trafficDensity: 'Low' | 'Medium' | 'High';
  corridorAvailability: number;   // percentage 0-100
  tasksConsolidated: number;
  departmentsInvolved: number;
  durationFit: number;            // 0-1 how well duration matches needed
  historicalEfficiency: number;   // 0-1
}): number {
  const trafficMap = { 'Low': 25, 'Medium': 15, 'High': 5 };
  const trafficScore = trafficMap[params.trafficDensity];

  // Corridor availability (0-20)
  const availabilityScore = Math.round(params.corridorAvailability / 5);

  // Task consolidation bonus (0-20)
  const consolidationScore = Math.min(20, params.tasksConsolidated * 5);

  // Multi-department coordination bonus (0-15)
  const coordScore = Math.min(15, params.departmentsInvolved * 5);

  // Duration fit (0-10)
  const durationScore = Math.round(params.durationFit * 10);

  // Historical efficiency (0-10)
  const historyScore = Math.round(params.historicalEfficiency * 10);

  return Math.min(100, trafficScore + availabilityScore + consolidationScore + coordScore + durationScore + historyScore);
}
