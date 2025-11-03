import { User, Client, AttendanceRecord, Notice, Role, Location } from '../types';

// --- MOCK DATABASE ---

const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@auditfirm.com', role: Role.ADMIN },
  { id: '2', name: 'Alice Johnson', email: 'alice@auditfirm.com', role: Role.EMPLOYEE },
  { id: '3', name: 'Bob Williams', email: 'bob@auditfirm.com', role: Role.EMPLOYEE },
];

const clients: Client[] = [
  { id: 'c1', name: 'Innovate Corp', address: '123 Tech Avenue' },
  { id: 'c2', name: 'Global Solutions Ltd.', address: '456 Business Blvd' },
  { id: 'c3', name: 'Quantum Industries', address: '789 Enterprise Way' },
];

let attendanceRecords: AttendanceRecord[] = [
    { 
        id: 'a1', 
        userId: '2', 
        userName: 'Alice Johnson',
        checkInTime: new Date(new Date().setDate(new Date().getDate() - 1)), 
        checkOutTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(17)),
        location: { lat: 34.0522, lng: -118.2437 },
        clientId: 'c1',
        clientName: 'Innovate Corp'
    }
];

let notices: Notice[] = [
  { id: 'n1', title: 'Upcoming Holiday', content: 'The office will be closed next Monday for the public holiday.', createdAt: new Date() },
  { id: 'n2', title: 'New Software Training', content: 'All employees are required to attend the new audit software training session on Friday at 10 AM.', createdAt: new Date() },
];

// --- MOCK API FUNCTIONS ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  getUsers: async (): Promise<User[]> => {
    await delay(300);
    return [...users];
  },

  findUserByEmail: async(email: string): Promise<User | undefined> => {
    await delay(300);
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  },
  
  getClients: async (): Promise<Client[]> => {
    await delay(200);
    return [...clients];
  },
  
  getNotices: async (): Promise<Notice[]> => {
    await delay(400);
    return [...notices].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  addNotice: async (title: string, content: string): Promise<Notice> => {
    await delay(500);
    const newNotice: Notice = {
      id: `n${notices.length + 1}`,
      title,
      content,
      createdAt: new Date(),
    };
    notices.unshift(newNotice);
    return newNotice;
  },

  getAttendanceRecords: async (): Promise<AttendanceRecord[]> => {
    await delay(600);
    return [...attendanceRecords].sort((a,b) => b.checkInTime.getTime() - a.checkInTime.getTime());
  },

  getCurrentAttendance: async (userId: string): Promise<AttendanceRecord | undefined> => {
    await delay(200);
    return attendanceRecords.find(a => a.userId === userId && !a.checkOutTime);
  },

  checkIn: async (userId: string, clientId: string, location: Location): Promise<AttendanceRecord> => {
    await delay(1000);
    const user = users.find(u => u.id === userId);
    const client = clients.find(c => c.id === clientId);
    if (!user || !client) {
      throw new Error('User or Client not found');
    }

    const existing = await api.getCurrentAttendance(userId);
    if (existing) {
      throw new Error('User is already checked in.');
    }

    const newRecord: AttendanceRecord = {
      id: `a${attendanceRecords.length + 1}`,
      userId,
      userName: user.name,
      clientId,
      clientName: client.name,
      checkInTime: new Date(),
      location,
    };
    attendanceRecords.push(newRecord);
    return newRecord;
  },

  checkOut: async (userId: string): Promise<AttendanceRecord> => {
    await delay(1000);
    const record = await api.getCurrentAttendance(userId);
    if (!record) {
      throw new Error('No active check-in found to check out.');
    }
    record.checkOutTime = new Date();
    return { ...record };
  },
};