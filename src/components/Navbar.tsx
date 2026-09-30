import React, { useState } from 'react';
import { Role, Student } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  UserCheck, 
  User, 
  ChevronDown, 
  RotateCcw, 
  Check, 
  QrCode, 
  ClipboardList, 
  Clock, 
  Users,
  Camera,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  currentStudent: Student | null;
  students: Student[];
  activeAdminTab: 'rollcall' | 'roster' | 'assignment' | 'history';
  onRoleChange: (role: Role, studentId?: string) => void;
  onAdminTabChange: (tab: 'rollcall' | 'roster' | 'assignment' | 'history') => void;
  onResetData: () => void;
  onLogout: () => void;
  pendingAssignmentCount: number;
  hasActiveSession: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentStudent,
  students,
  activeAdminTab,
  onRoleChange,
  onAdminTabChange,
  onResetData,
  onLogout,
  pendingAssignmentCount,
  hasActiveSession,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-[#182B49] text-white sticky top-0 z-40 border-b border-slate-700/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark */}
        <div 
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => {
            if (currentRole === 'admin') onAdminTabChange('rollcall');
          }}
        >
          <BrandLogo size="md" />
          <span className="text-xl font-black tracking-tight text-white inline-flex items-center select-none">
            {['c', 'l', 'a', 's', 's', 'i', 'o'].map((letter, index) => (
              <span
                key={index}
                className="animate-bounce-letter inline-block"
                style={{
                  animationDelay: `${index * 0.12}s`,
                  ['--rot' as any]: index % 2 === 0 ? '-6deg' : '6deg',
                }}
              >
                {letter === 'i' ? (
                  <span className="text-cyan-300">i</span>
                ) : (
                  letter
                )}
              </span>
            ))}
          </span>
        </div>

        {/* Zone 2: Navigation Links (Teacher Tabs when in admin role) */}
        {currentRole === 'admin' ? (
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => onAdminTabChange('rollcall')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeAdminTab === 'rollcall'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>點名簽到</span>
              {hasActiveSession && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              onClick={() => onAdminTabChange('roster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeAdminTab === 'roster'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>學生名冊</span>
            </button>

            <button
              onClick={() => onAdminTabChange('assignment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeAdminTab === 'assignment'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>作業催繳</span>
              {pendingAssignmentCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {pendingAssignmentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onAdminTabChange('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeAdminTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>歷史紀錄</span>
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center space-x-2 text-xs text-blue-200">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>學生端簽到模式：掃描老師投影機或螢幕 QR Code 即可簽到</span>
          </div>
        )}

        {/* Zone 3: Account / Role Switcher Menu */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition flex items-center space-x-2 text-slate-200"
            >
              {currentRole === 'admin' ? (
                <>
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>任課教師 (Admin)</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{currentStudent?.name || '學生'} ({currentStudent?.no || '未登入'})</span>
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 text-xs"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">切換操作身分</p>
                </div>

                {/* Teacher Account Option */}
                <button
                  onClick={() => {
                    onRoleChange('admin');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center justify-between text-slate-700 transition"
                >
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold">任課教師 / 助教</div>
                      <div className="text-[10px] text-slate-400">完整控制、點名發布、作業催繳</div>
                    </div>
                  </div>
                  {currentRole === 'admin' && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>

                <div className="px-4 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100">
                  學生測試帳號
                </div>

                {/* Student 1: 陳小明 */}
                {students.slice(0, 3).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      onRoleChange('student', st.id);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 flex items-center justify-between text-slate-700 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-semibold">{st.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{st.no} · {st.status === 'present' ? '已簽到' : '尚未簽到'}</div>
                      </div>
                    </div>
                    {currentRole === 'student' && currentStudent?.id === st.id && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 flex items-center space-x-2 transition font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span>登出當前帳號</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('確定重置為預設示範資料嗎？所有修改將還原。')) {
                        onResetData();
                        setDropdownOpen(false);
                      }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                    <span>還原為初始範例資料</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Direct Logout Button */}
          <button
            onClick={onLogout}
            title="登出帳號"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/80 hover:text-red-300 border border-slate-700/80 text-xs font-semibold text-slate-300 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">登出</span>
          </button>
        </div>
      </div>
    </header>
  );
};
