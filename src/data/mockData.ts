import { ClassItem, Student, Assignment, AssignmentSubmission, HistorySession, AttendanceSession, AdminCredentials } from '../types';

export const defaultAdminCredentials: AdminCredentials = {
  account: 'admin',
  password: 'admin123',
  name: '陳教授 (系統管理員)',
};

export const initialClasses: ClassItem[] = [
  {
    id: 'class_01',
    name: '資訊工程二甲',
    course: '計算機組織',
    department: '資訊工程學系',
    grade: '二年級',
    count: 12,
  },
  {
    id: 'class_02',
    name: '資訊工程三乙',
    course: '作業系統概論',
    department: '資訊工程學系',
    grade: '三年級',
    count: 10,
  },
  {
    id: 'class_03',
    name: '電機工程一丙',
    course: '數位邏輯設計',
    department: '電機工程學系',
    grade: '一年級',
    count: 8,
  }
];

export const initialStudents: Student[] = [
  { id: 's1', no: 'B11001001', name: '陳小明', email: 'b11001001@univ.edu.tw', password: 'password123', status: 'present', time: '08:12', attendanceRate: '96%', accountStatus: 'active', classId: 'class_01' },
  { id: 's2', no: 'B11001002', name: '林大山', email: 'b11001002@univ.edu.tw', password: 'password123', status: 'present', time: '08:14', attendanceRate: '92%', accountStatus: 'active', classId: 'class_01' },
  { id: 's3', no: 'B11001003', name: '張雅婷', email: 'b11001003@univ.edu.tw', password: 'password123', status: 'late', time: '08:24', attendanceRate: '88%', accountStatus: 'active', classId: 'class_01' },
  { id: 's4', no: 'B11001004', name: '黃建豪', email: 'b11001004@univ.edu.tw', password: 'password123', status: 'absent', time: '--:--', attendanceRate: '75%', accountStatus: 'active', classId: 'class_01' },
  { id: 's5', no: 'B11001005', name: '李佳蓉', email: 'b11001005@univ.edu.tw', password: 'password123', status: 'leave', time: '事假', attendanceRate: '90%', accountStatus: 'active', classId: 'class_01' },
  { id: 's6', no: 'B11001006', name: '王宗憲', email: 'b11001006@univ.edu.tw', password: 'password123', status: 'present', time: '08:15', attendanceRate: '98%', accountStatus: 'active', classId: 'class_01' },
  { id: 's7', no: 'B11001007', name: '許美華', email: 'b11001007@univ.edu.tw', password: 'password123', status: 'present', time: '08:18', attendanceRate: '96%', accountStatus: 'active', classId: 'class_01' },
  { id: 's8', no: 'B11001008', name: '郭冠宇', email: 'b11001008@univ.edu.tw', password: 'password123', status: 'present', time: '08:10', attendanceRate: '100%', accountStatus: 'active', classId: 'class_01' },
  { id: 's9', no: 'B11001009', name: '趙子龍', email: 'b11001009@univ.edu.tw', password: 'password123', status: 'present', time: '08:11', attendanceRate: '94%', accountStatus: 'active', classId: 'class_01' },
  { id: 's10', no: 'B11001010', name: '劉雅琪', email: 'b11001010@univ.edu.tw', password: 'password123', status: 'present', time: '08:16', attendanceRate: '90%', accountStatus: 'active', classId: 'class_01' },
  { id: 's11', no: 'B11001011', name: '鄭柏翰', email: 'b11001011@univ.edu.tw', password: 'password123', status: 'late', time: '08:28', attendanceRate: '85%', accountStatus: 'active', classId: 'class_01' },
  { id: 's12', no: 'B11001012', name: '謝淑芬', email: 'b11001012@univ.edu.tw', password: 'password123', status: 'absent', time: '--:--', attendanceRate: '80%', accountStatus: 'active', classId: 'class_01' },
];

export const initialAssignments: Assignment[] = [
  {
    id: 'a1',
    classId: 'class_01',
    courseName: '計算機組織',
    title: '第一次作業：MIPS 指令集與組譯實作',
    due: '2026/10/05 23:59',
    description: '請依照課堂投影片要求，實作簡易 MIPS 算術管線與暫存器操作，並上傳 800 字報告 PDF。',
    status: 'active',
    unsubmittedList: ['黃建豪 (B11001004)', '謝淑芬 (B11001012)', '張雅婷 (B11001003)'],
    createdAt: Date.now() - 3600000 * 48
  },
  {
    id: 'a2',
    classId: 'class_01',
    courseName: '計算機組織',
    title: '第二次作業：32 位元 ALU 算術邏輯單元設計',
    due: '2026/10/12 17:00',
    description: '使用 Verilog 設計 32-bit ALU，並完成 Testbench 模擬驗證波形截圖。',
    status: 'active',
    unsubmittedList: ['黃建豪 (B11001004)', '林大山 (B11001002)'],
    createdAt: Date.now() - 3600000 * 24
  },
  {
    id: 'a3',
    classId: 'class_01',
    courseName: '計算機組織',
    title: '預習回饋：快取記憶體 (Cache) 命中率分析',
    due: '2026/09/27 23:59',
    description: '研讀第七章快取置換策略（Direct mapped vs 4-way Set Associative），回答課堂問題。',
    status: 'finished',
    unsubmittedList: [],
    createdAt: Date.now() - 3600000 * 120
  }
];

export const initialSubmissions: AssignmentSubmission[] = [
  // For Assignment 1
  { id: 'sub_a1_s1', assignmentId: 'a1', studentId: 's1', studentNo: 'B11001001', studentName: '陳小明', isSubmitted: true, submittedAt: Date.now() - 3600000 * 12, remindedCount: 0 },
  { id: 'sub_a1_s2', assignmentId: 'a1', studentId: 's2', studentNo: 'B11001002', studentName: '林大山', isSubmitted: true, submittedAt: Date.now() - 3600000 * 18, remindedCount: 0 },
  { id: 'sub_a1_s3', assignmentId: 'a1', studentId: 's3', studentNo: 'B11001003', studentName: '張雅婷', isSubmitted: false, remindedCount: 1, lastRemindedAt: Date.now() - 3600000 * 4, reminderMessage: '請同學儘快繳交，逾期將依系規扣分！' },
  { id: 'sub_a1_s4', assignmentId: 'a1', studentId: 's4', studentNo: 'B11001004', studentName: '黃建豪', isSubmitted: false, remindedCount: 2, lastRemindedAt: Date.now() - 3600000 * 6, reminderMessage: '請於週五前繳交第1次作業！' },
  { id: 'sub_a1_s5', assignmentId: 'a1', studentId: 's5', studentNo: 'B11001005', studentName: '李佳蓉', isSubmitted: true, submittedAt: Date.now() - 3600000 * 20, remindedCount: 0 },
  { id: 'sub_a1_s6', assignmentId: 'a1', studentId: 's6', studentNo: 'B11001006', studentName: '王宗憲', isSubmitted: true, submittedAt: Date.now() - 3600000 * 10, remindedCount: 0 },
  { id: 'sub_a1_s7', assignmentId: 'a1', studentId: 's7', studentNo: 'B11001007', studentName: '許美華', isSubmitted: true, submittedAt: Date.now() - 3600000 * 15, remindedCount: 0 },
  { id: 'sub_a1_s8', assignmentId: 'a1', studentId: 's8', studentNo: 'B11001008', studentName: '郭冠宇', isSubmitted: true, submittedAt: Date.now() - 3600000 * 25, remindedCount: 0 },
  { id: 'sub_a1_s9', assignmentId: 'a1', studentId: 's9', studentNo: 'B11001009', studentName: '趙子龍', isSubmitted: true, submittedAt: Date.now() - 3600000 * 14, remindedCount: 0 },
  { id: 'sub_a1_s10', assignmentId: 'a1', studentId: 's10', studentNo: 'B11001010', studentName: '劉雅琪', isSubmitted: true, submittedAt: Date.now() - 3600000 * 11, remindedCount: 0 },
  { id: 'sub_a1_s11', assignmentId: 'a1', studentId: 's11', studentNo: 'B11001011', studentName: '鄭柏翰', isSubmitted: true, submittedAt: Date.now() - 3600000 * 8, remindedCount: 0 },
  { id: 'sub_a1_s12', assignmentId: 'a1', studentId: 's12', studentNo: 'B11001012', studentName: '謝淑芬', isSubmitted: false, remindedCount: 1, lastRemindedAt: Date.now() - 3600000 * 2, reminderMessage: '請同學確認是否已完成作業！' },
];

export const initialHistorySessions: HistorySession[] = [
  {
    id: 'h1',
    sessionId: 'session_hist_01',
    date: '2026/09/29',
    course: '計算機組織',
    className: '資訊工程二甲',
    startTime: '08:10',
    endTime: '08:25',
    present: 10,
    late: 1,
    leave: 1,
    absent: 0,
    total: 12,
    records: []
  },
  {
    id: 'h2',
    sessionId: 'session_hist_02',
    date: '2026/09/22',
    course: '計算機組織',
    className: '資訊工程二甲',
    startTime: '08:10',
    endTime: '08:25',
    present: 11,
    late: 1,
    leave: 0,
    absent: 0,
    total: 12,
    records: []
  },
  {
    id: 'h3',
    sessionId: 'session_hist_03',
    date: '2026/09/15',
    course: '計算機組織',
    className: '資訊工程二甲',
    startTime: '08:10',
    endTime: '08:20',
    present: 12,
    late: 0,
    leave: 0,
    absent: 0,
    total: 12,
    records: []
  }
];

export const STORAGE_KEY = 'classio_data_state_v1';

export interface AppStateData {
  classes: ClassItem[];
  currentClassId: string;
  students: Student[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  history: HistorySession[];
  activeSession: AttendanceSession | null;
  adminCredentials?: AdminCredentials;
}

export function loadStoredData(): AppStateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.students && Array.isArray(parsed.students)) {
        parsed.students = parsed.students.map((s: Student) => ({
          ...s,
          password: s.password || 'password123',
        }));
      }
      if (!parsed.adminCredentials) {
        parsed.adminCredentials = defaultAdminCredentials;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load stored data', e);
  }

  const defaultState: AppStateData = {
    classes: initialClasses,
    currentClassId: 'class_01',
    students: initialStudents,
    assignments: initialAssignments,
    submissions: initialSubmissions,
    history: initialHistorySessions,
    adminCredentials: defaultAdminCredentials,
    activeSession: {
      sessionId: 'session_live_demo',
      classId: 'class_01',
      courseName: '計算機組織',
      date: new Date().toISOString().substring(0, 10).replace(/-/g, '/'),
      startTime: '08:10',
      qrToken: 'token_initial_demo_token',
      qrExpiredAt: Date.now() + 5 * 60 * 1000,
      status: 'active',
      durationMinutes: 5,
    }
  };
  return defaultState;
}

export function saveStoredData(data: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}
