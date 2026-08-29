import { pool, testConnection } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  corridorsData,
  maintenanceTasksData,
  maintenanceBlocksData,
  conflictsData,
  aiRecommendationsData,
  systemIntegrationsData,
} from './data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedDatabase() {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.warn('PostgreSQL database server not running or connection refused. Skipping database auto-seed.');
    return;
  }

  try {
    console.log('Initializing PostgreSQL database schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('PostgreSQL tables & schema created successfully.');

    // 1. Seed Corridors
    console.log('Seeding Corridors table...');
    for (const c of corridorsData) {
      await pool.query(
        `INSERT INTO corridors (id, name, from_station, to_station, total_km, available_hours, train_density, planned_blocks, available_capacity, risk, time_slots)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.name, c.from, c.to, c.totalKm, c.availableHours, c.trainDensity, c.plannedBlocks, c.availableCapacity, c.risk, JSON.stringify(c.timeSlots)]
      );
    }

    // 2. Seed Maintenance Tasks
    console.log('Seeding Maintenance Tasks table...');
    for (const t of maintenanceTasksData) {
      await pool.query(
        `INSERT INTO maintenance_tasks (id, department, asset, asset_type, location, km_from, km_to, corridor, issue, maintenance_type, criticality, priority, priority_score, due_date, estimated_duration, status, recommended_block, safety_impact, failure_risk, overdue_days)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (id) DO NOTHING`,
        [
          t.id, t.department, t.asset, t.assetType, t.location, t.kmFrom, t.kmTo, t.corridor,
          t.issue, t.maintenanceType, t.criticality, t.priority, t.priorityScore, t.dueDate,
          t.estimatedDuration, t.status, t.recommendedBlock || null, t.safetyImpact, t.failureRisk, t.overdueDays
        ]
      );
    }

    // 3. Seed Maintenance Blocks
    console.log('Seeding Maintenance Blocks table...');
    for (const b of maintenanceBlocksData) {
      await pool.query(
        `INSERT INTO maintenance_blocks (id, block_date, start_time, end_time, corridor, km_from, km_to, departments, task_ids, status, is_coordinated, suitability_score, train_impact)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [b.id, b.date, b.startTime, b.endTime, b.corridor, b.kmFrom, b.kmTo, b.departments, b.tasks, b.status, b.isCoordinated, b.suitabilityScore, b.trainImpact]
      );
    }

    // 4. Seed Conflicts
    console.log('Seeding Conflicts table...');
    for (const cf of conflictsData) {
      await pool.query(
        `INSERT INTO conflicts (id, severity, description, location, km_range, current_block, conflict_with, conflict_time, ai_solution, expected_impact, impact_reduction, status, related_block_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [cf.id, cf.severity, cf.description, cf.location, cf.kmRange, cf.currentBlock, cf.conflictWith, cf.conflictTime, cf.aiSolution, cf.expectedImpact, cf.impactReduction, cf.status, cf.relatedBlockId || null]
      );
    }

    // 5. Seed AI Recommendations
    console.log('Seeding AI Recommendations table...');
    for (const rec of aiRecommendationsData) {
      await pool.query(
        `INSERT INTO ai_recommendations (id, block_id, rec_date, suggested_time, duration_minutes, corridor, is_coordinated, suitability_score, train_impact, efficiency_gain, trains_affected, downtime_saved_minutes, conflict_avoided, explanation, status, reasons, tasks_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (id) DO NOTHING`,
        [
          rec.id, rec.blockId || null, rec.date || null, rec.suggestedTime || '11:05–16:05', rec.durationMinutes || 300,
          rec.corridor, rec.isCoordinated ?? true, rec.suitabilityScore, rec.trainImpact || 'Low', rec.efficiencyGain || '',
          rec.trainsAffected || 0, rec.downtimeSavedMinutes || 140, rec.conflictAvoided || '', rec.explanation || '',
          rec.status || 'Pending', rec.reasons || [], JSON.stringify(rec.tasks || [])
        ]
      );
    }

    // 6. Seed System Integrations
    console.log('Seeding System Integrations table...');
    for (const sys of systemIntegrationsData) {
      await pool.query(
        `INSERT INTO system_integrations (id, name, full_name, department, endpoint, status, last_sync, records_count, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [sys.id, sys.name, sys.fullName, sys.department, sys.endpoint, sys.status, sys.lastSync, sys.recordsCount || 0, sys.description]
      );
    }

    console.log('PostgreSQL database successfully populated with all Mumbai Suburban Trans-Harbour records!');
  } catch (err) {
    console.error('Error during PostgreSQL database seeding:', err);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => pool.end());
}
