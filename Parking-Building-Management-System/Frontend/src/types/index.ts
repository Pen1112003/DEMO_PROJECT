// Common TypeScript Types for Parking Building Management System (SU26SWP08)

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'DRIVER';
  createdAt: string;
}

export interface ParkingFacility {
  facilityId: string;
  facilityCode: string;
  facilityName: string;
  buildingName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrRegion?: string;
  postalCode?: string;
  country: string;
  timezone: string;
  contactPhone?: string;
  contactEmail?: string;
  totalFloors?: number;
  totalZones?: number;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSlot {
  slotId: string;
  zoneId: string;
  slotNumber: string;
  status: 'free' | 'occupied' | 'reserved' | 'maintenance' | 'locked';
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSession {
  sessionId: string;
  facilityId: string;
  slotId?: string;
  licensePlate: string;
  ticketCode: string;
  entryTime: string;
  exitTime?: string;
  status: 'active' | 'completed' | 'exception_lost' | 'exception_mismatch' | 'unpaid';
  rawFee?: number;
  penaltyFee?: number;
  totalPaid?: number;
  createdAt: string;
  updatedAt: string;
}
