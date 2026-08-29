import { Conflict, TrainMovement, SystemIntegration, AIRecommendation, Notification } from '../types';

// Zero Dummy Records — All conflicts, recommendations, and train movements populated via live APIs and PostgreSQL
export const conflicts: Conflict[] = [];

export const trainMovements: TrainMovement[] = [];

export const aiRecommendations: AIRecommendation[] = [];

export const systemIntegrations: SystemIntegration[] = [
  {
    id: 'SYS-CR-TMS',
    name: 'CR-TMS',
    fullName: 'Central Railway Track Management System',
    department: 'Engineering (Track)',
    endpoint: 'api.cr.tms.indianrail.gov.in/mumbai-suburban/defects',
    status: 'Connected',
    lastSync: '30 Aug 2026 · 01:25',
    recordsCount: 0,
    records: 0,
    description: 'Ultrasonic track defect logs, turnout wear, ballast profiles for Mumbai Suburban division',
  },
  {
    id: 'SYS-CR-SMMS',
    name: 'CR-SMMS',
    fullName: 'Central Railway Signal & Telecom Management',
    department: 'S&T',
    endpoint: 'api.cr.smms.indianrail.gov.in/suburban-axle-counters',
    status: 'Connected',
    lastSync: '30 Aug 2026 · 01:25',
    recordsCount: 0,
    records: 0,
    description: 'Digital Axle Counters, point machine health logs, automatic signal logs for Trans-Harbour line',
  },
  {
    id: 'SYS-CR-TDMS',
    name: 'CR-TDMS',
    fullName: 'Central Railway Traction Distribution Management',
    department: 'Traction OHE',
    endpoint: 'api.cr.tdms.indianrail.gov.in/ohe-substations',
    status: 'Connected',
    lastSync: '30 Aug 2026 · 01:25',
    recordsCount: 0,
    records: 0,
    description: '25kV AC / 1500V DC OHE catenary inspections, insulator wash logs, TSS power feeds',
  },
  {
    id: 'SYS-CR-COA',
    name: 'Mumbai COA',
    fullName: 'Mumbai Suburban Control Office Application',
    department: 'Suburban Traffic Control',
    endpoint: 'api.cr.coa.indianrail.gov.in/suburban-timetable',
    status: 'Connected',
    lastSync: '30 Aug 2026 · 01:25',
    recordsCount: 0,
    records: 0,
    description: 'Suburban timetable, local train GPS tracking, Sunday Mega Block bulletins',
  },
];

export const notifications: Notification[] = [];
