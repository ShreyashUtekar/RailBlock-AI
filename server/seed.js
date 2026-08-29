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
    console.log('PostgreSQL tables & schema created successfully (Zero Dummy Records).');

    // 1. Seed Central Railway Master Corridors
    for (const c of corridorsData) {
      await pool.query(
        `INSERT INTO corridors (id, name, from_station, to_station, total_km, available_hours, train_density, planned_blocks, available_capacity, risk, time_slots)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.name, c.from, c.to, c.totalKm, c.availableHours, c.trainDensity, c.plannedBlocks, c.availableCapacity, c.risk, JSON.stringify(c.timeSlots)]
      );
    }

    // 2. Seed System Integration Markers
    for (const sys of systemIntegrationsData) {
      await pool.query(
        `INSERT INTO system_integrations (id, name, full_name, department, endpoint, status, last_sync, records_count, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [sys.id, sys.name, sys.fullName, sys.department, sys.endpoint, sys.status, sys.lastSync, sys.recordsCount || 0, sys.description]
      );
    }

    console.log('PostgreSQL database successfully initialized with Central Railway master infrastructure schemas.');
  } catch (err) {
    console.error('Error during PostgreSQL database seeding:', err);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => pool.end());
}
