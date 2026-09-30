import React, { useState } from 'react';
import { 
  ClassItem, 
  Student, 
  AttendanceSession, 
  Assignment, 
  AssignmentSubmission, 
  HistorySession 
} from '../types';
import { DynamicQRSection } from './DynamicQRSection';
import { LiveRoster } from './LiveRoster';
import { StudentRosterTable } from './StudentRosterTable';
import { AssignmentManager } from './AssignmentManager';
import { HistorySection } from './HistorySection';
import { BrandLogo } from './BrandLogo';
import { 
  Plus, 
  Repeat, 
  FileSpreadsheet, 
  QrCode, 
  Users, 
  ClipboardList, 
  Clock,
  ShieldCheck 
} from 'lucide-react';

interface AdminDashboardProps {
  currentClass: ClassItem;
  students: Student[];
  activeSession: AttendanceSession | null;
  activeAdminTab: 'rollcall' | 'roster' | 'assignment' | 'history';
  onAdminTabChange: (tab: 'rollcall' | 'roster' | 'assignment' | 'history') => void;
  onOpenSwitchClass: () => void;
  onOpenAddClass: () => void;
  onOpenAdminAccountModal?: () => void;
  onOpenExportModal: () => void;
  onOpenProjector: () => void;
  onEndSession: () => void;
  onSessionDurationChange: (minutes: number) => void;
  onSessionTimeAdjust: (seconds: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  remainingSeconds: number;
  totalDurationSeconds: number;
  isExpired: boolean;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  onManualRefresh: () => void;
  onCycleStudentStatus: (studentId: string) => void;
  onOpenAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onResetPassword: (student: Student) => void;
  onDeleteStudent: (studentId: string, studentName: string) => void;
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  onOpenAddAssignment: () => void;
  onToggleSubmission: (submissionId: string) => void;
  onSendDunningReminder: (assignmentId: string, reminderNote: string) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  history: HistorySession[];
  onExportHistorySession: (session: HistorySession) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentClass,
  students,
  activeSession,
  activeAdminTab,
  onAdminTabChange,
  onOpenSwitchClass,
  onOpenAddClass,
  onOpenAdminAccountModal,
  onOpenExportModal,
  onOpenProjector,
  onEndSession,
  onSessionDurationChange,
  onSessionTimeAdjust,
  isPaused,
  onTogglePause,
  remainingSeconds,
  totalDurationSeconds,
  isExpired,
  refreshInterval,
  onRefreshIntervalChange,
  onManualRefresh,
  onCycleStudentStatus,
  onOpenAddStudent,
  onEditStudent,
  onResetPassword,
  onDeleteStudent,
  assignments,
  submissions,
  onOpenAddAssignment,
  onToggleSubmission,
  onSendDunningReminder,
  onDeleteAssignment,
  history,
  onExportHistorySession,
}) => {
  const pendingAssignmentTotal = assignments.reduce((acc, a) => {
    const unsubmitted = submissions.filter(s => s.assignmentId === a.id && !s.isSubmitted).length;
    return acc + unsubmitted;
  }, 0);

  return (
    <div className="flex flex-col space-y-6">
      {/* Class Header Banner & Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <BrandLogo size="lg" />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentClass.name}
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center ${
                activeSession && !isExpired
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {activeSession && !isExpired ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    <span>點名進行中</span>
                  </>
                ) : (
                  <span>未開啟點名</span>
                )}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {currentClass.department} · {currentClass.grade} · 應到人數 {students.length} 人
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenSwitchClass}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Repeat className="w-4 h-4 text-slate-500" />
            <span>切換與管理班級</span>
          </button>

          <button
            onClick={onOpenAddClass}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>新增班級</span>
          </button>

          {onOpenAdminAccountModal && (
            <button
              onClick={onOpenAdminAccountModal}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              title="修改管理者登入帳號、稱謂與密碼"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>管理者帳號設定</span>
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            className="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>匯出點名表</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Mobile & Tablet Bar) */}
      <div className="flex md:hidden border-b border-slate-200 space-x-2 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => onAdminTabChange('rollcall')}
          className={`px-3 py-2 border-b-2 whitespace-nowrap transition flex items-center space-x-1 ${
            activeAdminTab === 'rollcall' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>點名簽到</span>
        </button>

        <button
          onClick={() => onAdminTabChange('roster')}
          className={`px-3 py-2 border-b-2 whitespace-nowrap transition flex items-center space-x-1 ${
            activeAdminTab === 'roster' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>學生名冊</span>
        </button>

        <button
          onClick={() => onAdminTabChange('assignment')}
          className={`px-3 py-2 border-b-2 whitespace-nowrap transition flex items-center space-x-1 ${
            activeAdminTab === 'assignment' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>作業催繳</span>
          {pendingAssignmentTotal > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full font-bold ml-1 font-mono-numbers">
              {pendingAssignmentTotal}
            </span>
          )}
        </button>

        <button
          onClick={() => onAdminTabChange('history')}
          className={`px-3 py-2 border-b-2 whitespace-nowrap transition flex items-center space-x-1 ${
            activeAdminTab === 'history' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>歷史紀錄</span>
        </button>
      </div>

      {/* Tab 1: Roll Call Dynamic QR & Live Roster */}
      {activeAdminTab === 'rollcall' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            {activeSession ? (
              <DynamicQRSection
                session={activeSession}
                students={students}
                onOpenProjector={onOpenProjector}
                onEndSession={onEndSession}
                onSessionDurationChange={onSessionDurationChange}
                onSessionTimeAdjust={onSessionTimeAdjust}
                isPaused={isPaused}
                onTogglePause={onTogglePause}
                remainingSeconds={remainingSeconds}
                totalDurationSeconds={totalDurationSeconds}
                isExpired={isExpired}
                refreshInterval={refreshInterval}
                onRefreshIntervalChange={onRefreshIntervalChange}
                onManualRefresh={onManualRefresh}
              />
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                <p className="text-slate-500 text-sm">目前無進行中的點名活動</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <LiveRoster
              students={students}
              onCycleStatus={onCycleStudentStatus}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Student Roster Management */}
      {activeAdminTab === 'roster' && (
        <StudentRosterTable
          students={students}
          className={currentClass.name}
          onAddStudent={onOpenAddStudent}
          onEditStudent={onEditStudent}
          onResetPassword={onResetPassword}
          onDeleteStudent={onDeleteStudent}
        />
      )}

      {/* Tab 3: Assignment Tracking & Dunning */}
      {activeAdminTab === 'assignment' && (
        <AssignmentManager
          assignments={assignments}
          submissions={submissions}
          students={students}
          className={currentClass.name}
          onAddAssignment={onOpenAddAssignment}
          onToggleSubmission={onToggleSubmission}
          onSendDunningReminder={onSendDunningReminder}
          onDeleteAssignment={onDeleteAssignment}
        />
      )}

      {/* Tab 4: History Logs */}
      {activeAdminTab === 'history' && (
        <HistorySection
          history={history}
          onExportSession={onExportHistorySession}
        />
      )}
    </div>
  );
};
