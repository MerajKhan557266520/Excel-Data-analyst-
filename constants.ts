import { ChartColumn, Hexagon, FileText, Globe, Box, Database, ShieldAlert, Cpu } from 'lucide-react';

export const MOCK_ADMIN_LOGS = [
  { id: '1', timestamp: '2023-10-27 10:42:15', user: 'j.doe@corp.net', action: 'UPLOAD_BATCH_CSV', status: 'SUCCESS' },
  { id: '2', timestamp: '2023-10-27 10:45:00', user: 'system_ai', action: 'ANOMALY_DETECTION_RUN', status: 'WARNING' },
  { id: '3', timestamp: '2023-10-27 11:02:33', user: 'm.smith@labs.io', action: 'EXPORT_MODEL_H5', status: 'SUCCESS' },
  { id: '4', timestamp: '2023-10-27 11:15:12', user: 'unknown_ip', action: 'AUTH_ATTEMPT_FAILED', status: 'ERROR' },
];

export const MOCK_USERS = [
  { id: 'u1', name: 'John Doe', role: 'Analyst', lastActive: '2 mins ago', filesUploaded: 142 },
  { id: 'u2', name: 'Maria Smith', role: 'Data Scientist', lastActive: '1 hour ago', filesUploaded: 89 },
  { id: 'u3', name: 'Alex Chen', role: 'Viewer', lastActive: '2 days ago', filesUploaded: 12 },
];

export const VIEW_OPTIONS = [
  { id: 'dashboard', label: 'Nexus Dashboard', icon: ChartColumn },
  { id: '3d', label: '3D Hologram', icon: Box },
  { id: 'geo', label: 'Geospatial Map', icon: Globe },
  { id: 'pivot', label: 'Smart Pivot', icon: Database },
  { id: 'nlp', label: 'Exec Summary', icon: FileText },
  { id: 'model', label: 'Predictive Model', icon: Cpu },
] as const;
