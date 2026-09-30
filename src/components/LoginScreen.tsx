import React, { useState } from 'react';
import { AuthUser, Student, AdminCredentials } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  UserCheck, 
  GraduationCap, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginScreenProps {
  students: Student[];
  adminCredentials?: AdminCredentials;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  students,
  adminCredentials,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'student'>('admin');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Switch tabs & clear inputs
  const handleTabSwitch = (tab: 'admin' | 'student') => {
    setActiveTab(tab);
    setAccount('');
    setPassword('');
    setErrorMessage(null);
    setSuccessNotice(null);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedAcc = account.trim().toLowerCase();
    const trimmedPwd = password.trim();

    const expectedAcc = (adminCredentials?.account || 'admin').trim().toLowerCase();
    const expectedPwd = (adminCredentials?.password || 'admin123').trim();
    const adminName = adminCredentials?.name || '陳教授 (系統管理員)';

    // Verify against configured admin credentials
    if (trimmedAcc === expectedAcc && trimmedPwd === expectedPwd) {
      setSuccessNotice('管理者身分驗證成功，正在進入管理控制台...');
      setTimeout(() => {
        onLoginSuccess({
          role: 'admin',
          account: adminCredentials?.account || 'admin',
          name: adminName,
        });
      }, 400);
      return;
    }

    setErrorMessage(`管理者帳號或密碼錯誤！(目前設定帳號：${adminCredentials?.account || 'admin'})`);
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedNo = account.trim();
    const trimmedPwd = password.trim();

    if (!trimmedNo || !trimmedPwd) {
      setErrorMessage('請輸入學號與密碼');
      return;
    }

    // Lookup in students roster
    const targetStudent = students.find(
      (s) => s.no.toLowerCase() === trimmedNo.toLowerCase()
    );

    if (!targetStudent) {
      setErrorMessage(
        `【查無此學生帳號】：學號「${trimmedNo}」尚未由管理者建立！管理者必須先於學生名冊中新增並配置帳號，學生才能登入。`
      );
      return;
    }

    if (targetStudent.accountStatus === 'suspended') {
      setErrorMessage(
        `【帳號已停權】：學生 ${targetStudent.name} (${targetStudent.no}) 目前已被管理者設為停權，無法登入！`
      );
      return;
    }

    // Check password (default password123)
    const expectedPassword = targetStudent.password || 'password123';
    if (trimmedPwd !== expectedPassword) {
      setErrorMessage(
        `【密碼錯誤】：學生 ${targetStudent.name} (${targetStudent.no}) 密碼不正確！若忘記密碼，請聯繫授課教師於學生名冊中重置。`
      );
      return;
    }

    // Student Login Succeeded!
    setSuccessNotice(`歡迎，${targetStudent.name} 同學！驗證通過，進入個人簽到中心...`);
    setTimeout(() => {
      onLoginSuccess({
        role: 'student',
        account: targetStudent.no,
        name: targetStudent.name,
        studentId: targetStudent.id,
      });
    }, 450);
  };

  const handleQuickFillAdmin = () => {
    setAccount(adminCredentials?.account || 'admin');
    setPassword(adminCredentials?.password || 'admin123');
    setErrorMessage(null);
  };

  const handleQuickFillStudent = (student: Student) => {
    setAccount(student.no);
    setPassword(student.password || 'password123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0B1938] to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md">
        
        {/* Top Brand Identity Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-3 transform hover:scale-105 transition-transform duration-300">
            <BrandLogo size="lg" />
          </div>

          <div className="flex items-center justify-center space-x-1 select-none mb-2">
            <span className="text-3xl font-black tracking-tight text-white inline-flex items-center">
              {['c', 'l', 'a', 's', 's', 'i', 'o'].map((letter, index) => (
                <span
                  key={index}
                  className="animate-bounce-letter inline-block"
                  style={{
                    animationDelay: `${index * 0.12}s`,
                    ['--rot' as any]: index % 2 === 0 ? '-6deg' : '6deg',
                  }}
                >
                  {letter === 'i' ? <span className="text-cyan-400">i</span> : letter}
                </span>
              ))}
            </span>
          </div>

          <p className="text-xs text-blue-200/80">
            智慧課堂動態 QR Code 點名 · 作業催繳系統
          </p>
        </div>

        {/* Portal Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Tab Selection */}
          <div className="grid grid-cols-2 p-1.5 bg-black/30 rounded-2xl mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => handleTabSwitch('admin')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>管理者 / 教師端</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('student')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>學生端</span>
            </button>
          </div>

          {/* Role Status Tag */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full animate-ping ${activeTab === 'admin' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
              <h2 className="text-base font-bold text-white">
                {activeTab === 'admin' ? '管理者登入' : '學生帳號登入'}
              </h2>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              activeTab === 'admin' 
                ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
            }`}>
              {activeTab === 'admin' ? '名冊編輯 & 點名授權' : '掃碼簽到 & 個人作業'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={activeTab === 'admin' ? handleAdminLogin : handleStudentLogin} className="space-y-4">
            
            {/* Account Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {activeTab === 'admin' ? '管理者帳號' : '學生學號 (登入帳號)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {activeTab === 'admin' ? <User className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                </div>
                <input
                  type="text"
                  required
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder={activeTab === 'admin' ? '請輸入 admin' : '例：B11001001'}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono-numbers"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  登入密碼
                </label>
                {activeTab === 'student' && (
                  <span className="text-[10px] text-slate-400">由管理者在名冊中配置</span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入密碼"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Notice */}
            {successNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98] ${
                activeTab === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <span>{activeTab === 'admin' ? '登入管理者端' : '登入學生端'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Helper / Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-white/10 text-xs">
            {activeTab === 'admin' ? (
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
                <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>測試用管理者帳號</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickFillAdmin}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    一鍵帶入
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-mono-numbers">
                  帳號：<span className="text-white font-bold">{adminCredentials?.account || 'admin'}</span> · 密碼：<span className="text-white font-bold">{adminCredentials?.password || 'admin123'}</span>
                </p>
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span>學生端帳號規則</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  學生必須由管理者在「學生名冊」中建立並配置密碼後才能登入。
                </p>
                
                {/* Quick Fill Student Sample Chips */}
                <div className="pt-1">
                  <div className="text-[10px] text-slate-400 mb-1.5 font-bold">名冊現有學生測試（點擊直接帶入）：</div>
                  <div className="flex flex-wrap gap-1.5">
                    {students.slice(0, 3).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleQuickFillStudent(st)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-emerald-600/40 border border-white/15 rounded-lg text-[10px] text-slate-200 transition cursor-pointer flex items-center space-x-1"
                      >
                        <span className="font-bold">{st.name}</span>
                        <span className="font-mono-numbers text-slate-400">({st.no})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Classio 智慧課堂管理系統 · 安全身分驗證與權限隔離
        </p>
      </div>
    </div>
  );
};
