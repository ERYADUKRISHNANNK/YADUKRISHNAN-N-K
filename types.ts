
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
  GAME = 'GAME'
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
  comments: {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: number;
  }[];
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

export interface User {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  notificationSettings: NotificationSettings;
  healthDetails?: HealthDetails;
  location?: string;
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

export interface ReductionTip {
  id: string;
  title: string;
  description: string;
  impact: string;
  icon: string;
}
