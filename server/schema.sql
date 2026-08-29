-- ============================================================
-- RailBlock AI — PostgreSQL Database DDL Schema
-- Central Railway • Mumbai Suburban Trans-Harbour Division
-- ============================================================

-- Drop tables if re-creating
DROP TABLE IF EXISTS ai_recommendations CASCADE;
DROP TABLE IF EXISTS conflicts CASCADE;
DROP TABLE IF EXISTS maintenance_blocks CASCADE;
DROP TABLE IF EXISTS maintenance_tasks CASCADE;
DROP TABLE IF EXISTS corridors CASCADE;
DROP TABLE IF EXISTS system_integrations CASCADE;

-- 1. CORRIDORS TABLE
CREATE TABLE corridors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    from_station VARCHAR(100) NOT NULL,
    to_station VARCHAR(100) NOT NULL,
    total_km NUMERIC(6, 2) NOT NULL,
    available_hours NUMERIC(4, 2) NOT NULL,
    train_density VARCHAR(20) NOT NULL CHECK (train_density IN ('Low', 'Medium', 'High')),
    planned_blocks INT DEFAULT 0,
    available_capacity INT DEFAULT 100,
    risk VARCHAR(20) DEFAULT 'Low' CHECK (risk IN ('Low', 'Medium', 'High', 'Critical')),
    time_slots JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. MAINTENANCE TASKS TABLE (TMS, SMMS, TDMS)
CREATE TABLE maintenance_tasks (
    id VARCHAR(50) PRIMARY KEY,
    department VARCHAR(50) NOT NULL CHECK (department IN ('Engineering', 'S&T', 'Traction')),
    asset VARCHAR(150) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    km_from NUMERIC(8, 2) NOT NULL,
    km_to NUMERIC(8, 2) NOT NULL,
    corridor VARCHAR(100) NOT NULL,
    issue TEXT NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    criticality VARCHAR(20) NOT NULL CHECK (criticality IN ('Critical', 'High', 'Medium', 'Low')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
    priority_score INT NOT NULL CHECK (priority_score BETWEEN 0 AND 100),
    due_date DATE NOT NULL,
    estimated_duration INT NOT NULL, -- minutes
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Recommended', 'Pending', 'Scheduled', 'In Progress', 'Completed', 'Overdue')),
    recommended_block VARCHAR(150),
    safety_impact INT DEFAULT 3 CHECK (safety_impact BETWEEN 1 AND 5),
    failure_risk NUMERIC(4, 2) DEFAULT 0.50,
    overdue_days INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. MAINTENANCE BLOCKS TABLE (Mega Blocks)
CREATE TABLE maintenance_blocks (
    id VARCHAR(50) PRIMARY KEY,
    block_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL, -- HH:mm
    end_time VARCHAR(10) NOT NULL,   -- HH:mm
    corridor VARCHAR(100) NOT NULL,
    km_from NUMERIC(8, 2) NOT NULL,
    km_to NUMERIC(8, 2) NOT NULL,
    departments TEXT[] NOT NULL,
    task_ids TEXT[] DEFAULT '{}',
    status VARCHAR(30) NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'Active', 'Completed', 'Cancelled')),
    is_coordinated BOOLEAN DEFAULT true,
    suitability_score INT DEFAULT 90 CHECK (suitability_score BETWEEN 0 AND 100),
    train_impact VARCHAR(20) DEFAULT 'Low' CHECK (train_impact IN ('None', 'Low', 'Medium', 'High')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CONFLICTS TABLE
CREATE TABLE conflicts (
    id VARCHAR(50) PRIMARY KEY,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('High', 'Medium', 'Low')),
    description TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
    km_range VARCHAR(100) NOT NULL,
    current_block VARCHAR(150) NOT NULL,
    conflict_with VARCHAR(200) NOT NULL,
    conflict_time VARCHAR(20) NOT NULL,
    ai_solution TEXT NOT NULL,
    expected_impact VARCHAR(200) NOT NULL,
    impact_reduction INT DEFAULT 80,
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Resolved', 'Dismissed')),
    related_block_id VARCHAR(50),
    related_train_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AI RECOMMENDATIONS TABLE
CREATE TABLE ai_recommendations (
    id VARCHAR(50) PRIMARY KEY,
    block_id VARCHAR(50),
    rec_date VARCHAR(50),
    suggested_time VARCHAR(50) NOT NULL,
    duration_minutes INT NOT NULL,
    corridor VARCHAR(100) NOT NULL,
    is_coordinated BOOLEAN DEFAULT true,
    suitability_score INT NOT NULL,
    train_impact VARCHAR(20) DEFAULT 'Low',
    efficiency_gain TEXT,
    trains_affected INT DEFAULT 0,
    downtime_saved_minutes INT DEFAULT 0,
    conflict_avoided TEXT,
    explanation TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reasons TEXT[] DEFAULT '{}',
    tasks_data JSONB DEFAULT '[]'::jsonb,
    score_breakdown JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SYSTEM INTEGRATIONS TABLE
CREATE TABLE system_integrations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    status VARCHAR(30) DEFAULT 'Connected',
    last_sync VARCHAR(100) NOT NULL,
    records_count INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST OPERATIONAL SEARCH
CREATE INDEX idx_tasks_corridor ON maintenance_tasks(corridor);
CREATE INDEX idx_tasks_department ON maintenance_tasks(department);
CREATE INDEX idx_blocks_corridor ON maintenance_blocks(corridor);
CREATE INDEX idx_blocks_date ON maintenance_blocks(block_date);
CREATE INDEX idx_conflicts_status ON conflicts(status);
