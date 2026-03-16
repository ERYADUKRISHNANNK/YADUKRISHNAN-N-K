
export enum Screen {
  DASHBOARD = 'DASHBOARD',
  MAP = 'MAP',
  CALCULATOR = 'CALCULATOR',
  RESULTS = 'RESULTS',
  SETTINGS = 'SETTINGS',
  EMERGENCY = 'EMERGENCY',
  PROFILE = 'PROFILE',
  AUTH = 'AUTH',
  COMMUNITY = 'COMMUNITY',
  STUDY = 'STUDY',
  GAME = 'GAME',
  ADMIN = 'ADMIN'
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface PollutionReport {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  locationName: string;
  lat: number;
  lng: number;
  description: string;
  imageUrl?: string;
  timestamp: number;
  likes: number;
  comments: Comment[];
}

export interface NotificationSettings {
  emergencyAlerts: boolean;
  aqiChanges: boolean;
  carbonMilestones: boolean;
  weeklyReports: boolean;
  healthTips: boolean;
  quietHours: {
    enabled: boolean;
    from: string;
    to: string;
  };
  alertSound: 'Siren' | 'Pulse' | 'Chime';
}

export interface HealthDetails {
  hasAsthma: boolean;
  respiratoryConditions: string[];
  pollutionSensitivity: 'Low' | 'Medium' | 'High';
  ageGroup: string;
}

export interface PreferredLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  alertThreshold: number;
}

export interface User {
  uid?: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  isLoggedIn: boolean;
  notificationSettings: NotificationSettings;
  healthDetails?: HealthDetails;
  location?: string;
  role?: 'user' | 'admin' | 'co-admin';
  status?: 'active' | 'suspended' | 'banned';
  preferredLocations?: PreferredLocation[];
  createdAt?: number;
}

export interface AISettings {
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemInstruction: string;
  enableGrounding: boolean;
}

export interface AdminStats {
  activeUsers: number;
  totalReports: number;
  avgAqi: number;
  systemHealth: 'Healthy' | 'Warning' | 'Critical';
  lastBackup: number;
}

export interface AdminBroadcast {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'high-pollution-areas';
  timestamp: number;
  sentBy: string;
}

export interface LocationData {
  name: string;
  lat?: number;
  lng?: number;
  aqi: number;
  pm25: number;
  no2: number;
  carbonIntensity?: number; // gCO2/kWh
}

export interface ImpactData {
  acUnits: number;
  fanUsage: number;
  energySource: string;
  co2Rate: number;
  gasLevels: number;
}

export interface FootprintResult {
  totalTons: number;
  breakdown: {
    acUsage: number;
    gasEmissions: number;
    energySource: number;
  };
}

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
}

export interface StudyNote {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
  pageIndex: number;
}

export interface ReductionTip {
  id: string;
  title: string;
  description: string;
  impact: string;
  icon: string;
}
