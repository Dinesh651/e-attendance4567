
export enum Role {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Client {
  id: string;
  name: string;
  address: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  location?: Location;
  clientId: string;
  clientName: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}
