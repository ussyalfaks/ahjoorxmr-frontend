export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'laptop';

export interface SessionLocation {
  city: string;
  country: string;
  countryCode: string;
  region?: string;
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
  ipAddress: string;
  location: SessionLocation;
  lastActive: string;
  lastActiveDisplay: string;
  isCurrent: boolean;
  authMethod: string;
  createdAt: string;
}
