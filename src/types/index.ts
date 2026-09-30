export type Role = 'admin' | 'student';

export type AttendanceStatus = 'present' | 'late' | 'leave' | 'absent' | 'pending';

export interface ClassItem {
  id: string;
  name: string;
  course?: string;
  department: string;
  grade: string;
  count: number;
}

export interface Student {
  id: string;
  no: string; // e.g. B11001001 (also account username)
  name: string;
  email: string;
  password?: string; // student account login password (managed by admin)
  status: AttendanceStatus;
  time: string; // e.g. "08:12" or "--:--"
  attendanceRate: string; // e.g. "95%"
  accountStatus: 'active' | 'suspended';
  classId: string;
}

export interface AdminCredentials {
  account: string; // admin username
  password: string; // admin password
  name: string; // admin display name
}

export interface AuthUser {
  role: Role;
  account: string;
  name: string;
  studentId?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  courseName: string;
  title: string;
  due: string;
  description: string;
  status: 'active' | 'reviewing' | 'finished';
  unsubmittedList: string[]; // student names or IDs
  createdAt: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentNo: string;
  studentName: string;
  isSubmitted: boolean;
  submittedAt?: number;
  remindedCount: number;
  lastRemindedAt?: number;
  reminderMessage?: string;
}

export interface AttendanceRecord {
  recordId: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  checkedInAt?: number;
  modifiedAt?: number;
  modifiedBy?: string;
}

export interface AttendanceSession {
  sessionId: string;
  classId: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime?: string;
  qrToken: string;
  qrExpiredAt: number;
  status: 'active' | 'ended';
  durationMinutes: number;
}

export interface QRCodePayload {
  sessionId: string;
  classId: string;
  courseName: string;
  date: string;
  startTime: string;
  token: string;
  ts: number;
  expiredAt: number;
}

export interface HistorySession {
  id: string;
  sessionId: string;
  date: string;
  course: string;
  className: string;
  startTime: string;
  endTime: string;
  present: number;
  late: number;
  leave: number;
  absent: number;
  total: number;
  records: AttendanceRecord[];
}
