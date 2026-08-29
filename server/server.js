import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, testConnection, query } from './db.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const RAILRADAR_API_KEY = process.env.RAILRADAR_API_KEY || 'rg_6f5b04ffd8a24b1ab02a424b72cb5b67';

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'online',
    service: 'RailBlock AI PostgreSQL Express Engine',
    division: 'Central Railway • Mumbai Suburban (BB)',
    railradarApi: {
      status: 'active',
      keyConfigured: !!RAILRADAR_API_KEY,
    },
    database: {
      type: 'PostgreSQL',
      connected: dbConnected,
    },
    timestamp: new Date().toISOString(),
  });
});

// ===== RAILRADAR LIVE TRAIN API PROXY =====
app.get('/api/railradar/train/:number', async (req, res) => {
  const { number } = req.params;
  const haltsOnly = req.query.haltsOnly || 'true';

  try {
    const response = await fetch(`https://api.railradar.in/v1/trains/${number}?haltsOnly=${haltsOnly}`, {
      headers: {
        'Authorization': `Bearer ${RAILRADAR_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        error: errData.error || { message: `RailRadar API returned status ${response.status}` },
      });
    }

    const data = await response.json();

    // Optionally auto-save fetched train to PostgreSQL train_movements table if connected
    if (data.success && data.data?.train) {
      const tr = data.data.train;
      const route = data.data.route || [];
      const deptTime = route[0]?.departure || '06:00';
      const arrTime = route[route.length - 1]?.arrival || '14:40';

      query(
        `INSERT INTO conflicts (id, severity, description, location, km_range, current_block, conflict_with, conflict_time, ai_solution, expected_impact, impact_reduction, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [
          `C-RR-${tr.number}`,
          'Medium',
          `RailRadar Live Schedule: Train #${tr.number} (${tr.name}) running on route`,
          'Central Railway Suburban Corridor',
          `Km 0–${tr.distance || 50}`,
          '06 Sep · Sunday Mega Block Window',
          `Train #${tr.number} (${tr.name})`,
          deptTime,
          `Monitor COA track possession gap before train departure at ${deptTime}`,
          'Schedule validated via RailRadar API',
          90,
          'Open',
        ]
      ).catch(() => {});
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to connect to RailRadar API' },
    });
  }
});

// ===== TASKS API =====
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await query('SELECT * FROM maintenance_tasks ORDER BY priority_score DESC');
    const tasks = result.rows.map((row) => ({
      id: row.id,
      department: row.department,
      asset: row.asset,
      assetType: row.asset_type,
      location: row.location,
      kmFrom: parseFloat(row.km_from),
      kmTo: parseFloat(row.km_to),
      corridor: row.corridor,
      issue: row.issue,
      maintenanceType: row.maintenance_type,
      criticality: row.criticality,
      priority: row.priority,
      priorityScore: row.priority_score,
      dueDate: row.due_date ? row.due_date.toISOString().split('T')[0] : '',
      estimatedDuration: row.estimated_duration,
      status: row.status,
      recommendedBlock: row.recommended_block,
      safetyImpact: row.safety_impact,
      failureRisk: parseFloat(row.failure_risk),
      overdueDays: row.overdue_days,
    }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const t = req.body;
    const id = `TASK-MH-${Math.floor(100 + Math.random() * 900)}`;
    await query(
      `INSERT INTO maintenance_tasks (id, department, asset, asset_type, location, km_from, km_to, corridor, issue, maintenance_type, criticality, priority, priority_score, due_date, estimated_duration, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [id, t.department, t.asset, t.assetType, t.location, t.kmFrom, t.kmTo, t.corridor, t.issue, t.maintenanceType, t.criticality, t.priority, t.priorityScore, t.dueDate, t.estimatedDuration, t.status || 'Pending']
    );
    res.status(201).json({ id, ...t });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== BLOCKS API =====
app.get('/api/blocks', async (req, res) => {
  try {
    const result = await query('SELECT * FROM maintenance_blocks ORDER BY created_at DESC');
    const blocks = result.rows.map((r) => ({
      id: r.id,
      date: r.block_date ? r.block_date.toISOString().split('T')[0] : r.block_date,
      startTime: r.start_time,
      endTime: r.end_time,
      corridor: r.corridor,
      kmFrom: parseFloat(r.km_from),
      kmTo: parseFloat(r.km_to),
      departments: r.departments,
      tasks: r.task_ids,
      status: r.status,
      isCoordinated: r.is_coordinated,
      suitabilityScore: r.suitability_score,
      trainImpact: r.train_impact,
    }));
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/blocks', async (req, res) => {
  try {
    const b = req.body;
    const id = `MB-THN-${Math.floor(500 + Math.random() * 500)}`;
    await query(
      `INSERT INTO maintenance_blocks (id, block_date, start_time, end_time, corridor, km_from, km_to, departments, task_ids, status, is_coordinated, suitability_score, train_impact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [id, b.date, b.startTime, b.endTime, b.corridor, b.kmFrom, b.kmTo, b.departments, b.tasks, b.status || 'Planned', b.isCoordinated, b.suitabilityScore, b.trainImpact]
    );
    res.status(201).json({ id, ...b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CORRIDORS API =====
app.get('/api/corridors', async (req, res) => {
  try {
    const result = await query('SELECT * FROM corridors ORDER BY id ASC');
    const corridors = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      from: r.from_station,
      to: r.to_station,
      totalKm: parseFloat(r.total_km),
      availableHours: parseFloat(r.available_hours),
      trainDensity: r.train_density,
      plannedBlocks: r.planned_blocks,
      availableCapacity: r.available_capacity,
      risk: r.risk,
      timeSlots: r.time_slots,
    }));
    res.json(corridors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CONFLICTS API =====
app.get('/api/conflicts', async (req, res) => {
  try {
    const result = await query('SELECT * FROM conflicts ORDER BY id ASC');
    const conflicts = result.rows.map((r) => ({
      id: r.id,
      severity: r.severity,
      description: r.description,
      location: r.location,
      kmRange: r.km_range,
      currentBlock: r.current_block,
      conflictWith: r.conflict_with,
      conflictTime: r.conflict_time,
      aiSolution: r.ai_solution,
      expectedImpact: r.expected_impact,
      impactReduction: r.impact_reduction,
      status: r.status,
      relatedBlockId: r.related_block_id,
    }));
    res.json(conflicts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/conflicts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    await query("UPDATE conflicts SET status = 'Resolved' WHERE id = $1", [id]);
    res.json({ success: true, message: `Conflict ${id} resolved` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== AI RECOMMENDATIONS API =====
app.get('/api/recommendations', async (req, res) => {
  try {
    const result = await query('SELECT * FROM ai_recommendations ORDER BY created_at DESC');
    const recs = result.rows.map((r) => ({
      id: r.id,
      blockId: r.block_id,
      date: r.rec_date,
      suggestedTime: r.suggested_time,
      durationMinutes: r.duration_minutes,
      corridor: r.corridor,
      isCoordinated: r.is_coordinated,
      suitabilityScore: r.suitability_score,
      trainImpact: r.train_impact,
      efficiencyGain: r.efficiency_gain,
      trainsAffected: r.trains_affected,
      downtimeSavedMinutes: r.downtime_saved_minutes,
      conflictAvoided: r.conflict_avoided,
      explanation: r.explanation,
      status: r.status,
      reasons: r.reasons,
      tasks: r.tasks_data,
    }));
    res.json(recs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`RailBlock AI Express + PostgreSQL Server running on http://localhost:${PORT}`);
  console.log(`RailRadar Live API Key Configured: ${RAILRADAR_API_KEY.substring(0, 10)}...`);
  await seedDatabase();
});
