import React, { useState } from 'react';
import { ClassItem, Student, AttendanceSession, AdminCredentials } from '../types';
import { 
  X, 
  Plus, 
  School, 
  CheckCircle2, 
  UserPlus, 
  Edit3, 
  KeyRound, 
  BookOpen, 
  Calendar, 
  FileText,
  StopCircle,
  FileSpreadsheet,
  Trash2,
  Lock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

/* 1. Switch & Manage Class Modal */
interface SwitchClassModalProps {
  classes: ClassItem[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  onOpenAddClass: () => void;
  onDeleteClass?: (classId: string, className: string) => void;
  onClose: () => void;
}

export const SwitchClassModal: React.FC<SwitchClassModalProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  onOpenAddClass,
  onDeleteClass,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">班級課程管理與切換</h3>
            <p className="text-xs text-slate-500 mt-0.5">點選可直接切換目前授課班級，或新增、刪減班級</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {classes.map((c) => {
            const isSelected = c.id === selectedClassId;
            return (
              <div
                key={c.id}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div 
                  onClick={() => {
                    onSelectClass(c.id);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{c.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {c.department} · {c.grade} · {c.count} 名學生
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {isSelected ? (
                    <span className="text-[11px] font-bold text-blue-600 bg-white px-2 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>當前班級</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectClass(c.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition cursor-pointer"
                    >
                      切換
                    </button>
                  )}

                  {/* Delete Class Button */}
                  {onDeleteClass && (
                    <button
                      type="button"
                      title={classes.length <= 1 ? '至少需保留一個班級，無法刪除' : `刪減/刪除「${c.name}」班級`}
                      disabled={classes.length <= 1}
                      onClick={() => onDeleteClass(c.id, c.name)}
                      className={`p-1.5 rounded-lg transition ${
                        classes.length <= 1 
                          ? 'text-slate-300 cursor-not-allowed' 
                          : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenAddClass();
          }}
          className="w-full py-3 rounded-2xl border border-dashed border-blue-300 hover:border-blue-600 hover:bg-blue-50 text-blue-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span>建立新班級課程 (+ 新增班級)</span>
        </button>
      </div>
    </div>
  );
};

/* 2. Add Class Modal */
interface AddClassModalProps {
  onClose: () => void;
  onConfirm: (name: string, dept: string, grade: string) => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({ onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [dept, setDept] = useState('資訊工程學系');
  const [grade, setGrade] = useState('二年級');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('請填寫班級名稱！');
      return;
    }
    onConfirm(name.trim(), dept.trim(), grade.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <School className="w-5 h-5 text-blue-600" />
            <span>建立新班級</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">班級代號 / 名稱：</label>
            <input
              type="text"
              placeholder="例：資訊工程四甲"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">開課系所：</label>
            <input
              type="text"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">修課年級：</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              建立課程班級
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* 3. Add Student Modal */
interface AddStudentModalProps {
  onClose: () => void;
  onConfirm: (no: string, name: string, email: string, password?: string) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onConfirm }) => {
  const [no, setNo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!no.trim() || !name.trim()) {
      alert('請填寫學號與姓名！');
      return;
    }
    const finalEmail = email.trim() || `${no.trim().toLowerCase()}@univ.edu.tw`;
    const finalPassword = password.trim() || 'password123';
    onConfirm(no.trim(), name.trim(), finalEmail, finalPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <span>新增班級學生帳號</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-blue-900 text-[11px] leading-relaxed">
          💡 管理者在此建立學生名單後，學生即可使用此「學號」與「登入密碼」進入學生端簽到。
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">學號 (登入帳號)：</label>
            <input
              type="text"
              placeholder="例：B11001015"
              value={no}
              onChange={(e) => setNo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono-numbers"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">學生姓名：</label>
            <input
              type="text"
              placeholder="例：陳志豪"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">初始登入密碼：</label>
            <input
              type="text"
              placeholder="預設為 password123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono-numbers"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">學生登入時需輸入此密碼</span>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">學校電子郵件 (選填)：</label>
            <input
              type="email"
              placeholder="留空將自動帶入 學號@univ.edu.tw"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono-numbers"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
            >
              建立並啟用學生帳號
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold cursor-pointer"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* 4. Edit Student Modal */
interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
  onConfirm: (name: string, no: string, status: 'active' | 'suspended', password?: string) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose, onConfirm }) => {
  const [name, setName] = useState(student.name);
  const [no, setNo] = useState(student.no);
  const [password, setPassword] = useState(student.password || 'password123');
  const [status, setStatus] = useState<'active' | 'suspended'>(student.accountStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !no.trim()) return;
    onConfirm(name.trim(), no.trim(), status, password.trim() || 'password123');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <span>編輯學生名單與登入帳號</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">姓名：</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">學號 (登入帳號)：</label>
            <input
              type="text"
              value={no}
              onChange={(e) => setNo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono-numbers"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">登入密碼：</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono-numbers"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">管理者可在此為學生修改登入密碼</span>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">帳號狀態：</label>
            <div className="flex items-center space-x-3 pt-1">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="accStatus"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                />
                <span className="text-emerald-700 font-bold">正常 (可登入簽到)</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="accStatus"
                  checked={status === 'suspended'}
                  onChange={() => setStatus('suspended')}
                />
                <span className="text-red-700 font-bold">停權 (禁止登入)</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
            >
              儲存學生帳號變更
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold cursor-pointer"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* 5. Add Assignment Modal */
interface AddAssignmentModalProps {
  onClose: () => void;
  onConfirm: (title: string, due: string, description: string) => void;
}

export const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({ onClose, onConfirm }) => {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('2026/10/20 23:59');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('請填寫作業名稱！');
      return;
    }
    onConfirm(title.trim(), due.trim(), description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>建立新課堂作業</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">作業標題：</label>
            <input
              type="text"
              placeholder="例：第三次作業：快取記憶體 Direct Mapping 模擬"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">繳交截止日期時間：</label>
            <input
              type="text"
              placeholder="2026/10/20 23:59"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono-numbers"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">作業說明與格式規範：</label>
            <textarea
              rows={3}
              placeholder="請說明繳交格式、檔案格式限制（如 PDF、ZIP）以及評分重點..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              發布作業並追蹤
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* 6. End Session Summary Modal */
interface EndSessionSummaryModalProps {
  session: AttendanceSession;
  students: Student[];
  onOpenExport: () => void;
  onClose: () => void;
}

export const EndSessionSummaryModal: React.FC<EndSessionSummaryModalProps> = ({
  session,
  students,
  onOpenExport,
  onClose,
}) => {
  const total = students.length;
  const present = students.filter(s => s.status === 'present').length;
  const late = students.filter(s => s.status === 'late').length;
  const leave = students.filter(s => s.status === 'leave').length;
  const absent = students.filter(s => s.status === 'absent').length;
  const rate = total > 0 ? (((present + late) / total) * 100).toFixed(1) + '%' : '0%';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">本次點名已成功結算</h3>
            <p className="text-xs text-slate-500 font-mono-numbers">{session.courseName} · {session.date}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs font-mono-numbers bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">應到人數：</span>
            <span className="font-bold text-slate-800">{total} 人</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-emerald-600 font-semibold">實到出席：</span>
            <span className="font-bold text-emerald-700">{present} 人</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-amber-600 font-semibold">課堂遲到：</span>
            <span className="font-bold text-amber-700">{late} 人</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-blue-600 font-semibold">核准請假：</span>
            <span className="font-bold text-blue-700">{leave} 人</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-red-600 font-semibold">缺席人數：</span>
            <span className="font-bold text-red-700">{absent} 人</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-700 font-bold">總出席率：</span>
            <span className="font-black text-blue-600 text-sm">{rate}</span>
          </div>
        </div>

        <div className="flex space-x-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onOpenExport();
            }}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>匯出點名表 (Excel)</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer"
          >
            確認完成
          </button>
        </div>
      </div>
    </div>
  );
};

/* 7. Admin Account & Password Modal (管理者帳號密碼修改) */
interface AdminAccountModalProps {
  currentCredentials: AdminCredentials;
  onClose: () => void;
  onConfirm: (newAccount: string, newPassword: string, newName: string) => void;
}

export const AdminAccountModal: React.FC<AdminAccountModalProps> = ({
  currentCredentials,
  onClose,
  onConfirm,
}) => {
  const [account, setAccount] = useState(currentCredentials.account);
  const [name, setName] = useState(currentCredentials.name);
  const [password, setPassword] = useState(currentCredentials.password);
  const [confirmPassword, setConfirmPassword] = useState(currentCredentials.password);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedAccount = account.trim();
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    if (!trimmedAccount) {
      setErrorMsg('請輸入管理者帳號！');
      return;
    }
    if (!trimmedName) {
      setErrorMsg('請輸入管理者姓名或稱謂！');
      return;
    }
    if (trimmedPassword.length < 4) {
      setErrorMsg('密碼長度至少需 4 個字元！');
      return;
    }
    if (trimmedPassword !== confirmPassword.trim()) {
      setErrorMsg('兩次輸入的新密碼不一致！');
      return;
    }

    onConfirm(trimmedAccount, trimmedPassword, trimmedName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>管理者帳號與密碼變更</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-blue-900 text-[11px] leading-relaxed">
          🔐 管理者可自由修改登入帳號、稱謂與登入密碼。儲存後下次登入管理者端時請使用新帳號與密碼。
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">管理者登入帳號：</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">管理者姓名 / 稱謂：</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">管理者新密碼：</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">確認新密碼：</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
            >
              儲存管理者帳號密碼
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold cursor-pointer"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* 8. Student Change Password Modal (學生端僅能改密碼) */
interface StudentChangePasswordModalProps {
  student: Student;
  onClose: () => void;
  onConfirm: (newPassword: string) => void;
}

export const StudentChangePasswordModal: React.FC<StudentChangePasswordModalProps> = ({
  student,
  onClose,
  onConfirm,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const actualOldPassword = student.password || 'password123';
    if (oldPassword.trim() !== actualOldPassword) {
      setErrorMsg('原登入密碼不正確！若忘記原密碼，請聯繫授課教師協助重置。');
      return;
    }

    const trimmedNew = newPassword.trim();
    if (trimmedNew.length < 4) {
      setErrorMsg('新密碼長度至少需 4 個字元！');
      return;
    }

    if (trimmedNew !== confirmPassword.trim()) {
      setErrorMsg('兩次輸入的新密碼不一致！');
      return;
    }

    onConfirm(trimmedNew);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>學生個人登入密碼修改</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-only account banner - strictly conveys student cannot change student ID or name */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">學生姓名：</span>
            <span className="font-bold text-slate-800">{student.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">學號 (登入帳號)：</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
              {student.no}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 leading-normal">
            ℹ️ 學號與姓名由授課教師名冊統一維護；學生端僅限修改個人登入密碼。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">目前原密碼：</label>
            <input
              type="password"
              placeholder="請輸入原密碼 (預設為 password123)"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">自訂新密碼：</label>
            <input
              type="password"
              placeholder="請輸入至少 4 碼新密碼"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">確認新密碼：</label>
            <input
              type="password"
              placeholder="請再次輸入新密碼"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
            >
              更新登入密碼
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold cursor-pointer"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
