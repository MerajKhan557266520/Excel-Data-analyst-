export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ANALYSIS = 'ANALYSIS',
  SIMULATION = 'SIMULATION',
  ADMIN = 'ADMIN',
  LIVE_SESSION = 'LIVE_SESSION'
}

export enum AIPersona {
  AURA = 'Aura', // Creative, Visual
  SENTRY = 'Sentry', // Security, Admin
  PROPHET = 'Prophet', // Predictive, Strategic
  ECHO = 'Echo' // General Assistant
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  timestamp: number;
  status: 'scanning' | 'tunneling' | 'secured';
}

export interface AnalysisResult {
  summary: string;
  keyTrends: string[];
  outliers: string[];
  metrics: { label: string; value: string | number; change?: string }[];
  suggestedActions: string[];
  rawJSON?: any;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  probability: number;
  impact: 'LOW' | 'MEDIUM' | 'CRITICAL' | 'EXTINCTION_LEVEL';
  actionPath: string[];
  projectedMetrics: { label: string; value: string }[];
}

export interface AdminUser {
  id: string;
  name: string;
  role: string;
  lastActive: string;
  securityClearance: 'L1' | 'L2' | 'L3' | 'OMNI';
}
