import React, { useState, useEffect, useRef } from 'react';
import { 
  Role, 
  Student, 
  AttendanceSession, 
  AttendanceStatus, 
  HistorySession,
  AuthUser
} from './types';
import { 
  loadStoredData, 
  saveStoredData, 
  AppStateData, 
  initialClasses, 
  initialStudents, 
  initialAssignments, 
  initialSubmissions, 
  initialHistorySessions,
  defaultAdminCredentials
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentPortal } from './components/StudentPortal';
import { FullscreenProjector } from './components/FullscreenProjector';
import { ExportModal } from './components/ExportModal';
import { LoginScreen } from './components/LoginScreen';
import { 
  SwitchClassModal, 
  AddClassModal, 
  AddStudentModal, 
  EditStudentModal, 
  AddAssignmentModal, 
  EndSessionSummaryModal,
  AdminAccountModal
} from './components/Modals';

export default function App() {
  // App Persistent State
  const [appState, setAppState] = useState<AppStateData>(() => loadStoredData());
  
  // Authentication State (Separating Admin Portal and Student Portal)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const savedAuth = localStorage.getItem('classio_auth_user');
      if (savedAuth) return JSON.parse(savedAuth);
    } catch (e) {}
    // Default to admin for immediate interactive preview, but with full ability to logout and log in as student
    return {
      role: 'admin',
      account: 'admin',
      name: '陳教授 (系統管理員)',
    };
  });

  const [currentRole, setCurrentRole] = useState<Role>(() => authUser?.role || 'admin');
  const [currentStudentId, setCurrentStudentId] = useState<string>(() => authUser?.studentId || 's1');
  const [activeAdminTab, setActiveAdminTab] = useState<'rollcall' | 'roster' | 'assignment' | 'history'>('rollcall');

  // Session Timers State
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(5);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(10); // dynamic anti-screenshot interval

  // Modal States
  const [showProjector, setShowProjector] = useState<boolean>(false);
  const [showSwitchClass, setShowSwitchClass] = useState<boolean>(false);
  const [showAddClass, setShowAddClass] = useState<boolean>(false);
  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddAssignment, setShowAddAssignment] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportingSession, setExportingSession] = useState<AttendanceSession | null>(null);
  const [showEndSessionSummary, setShowEndSessionSummary] = useState<boolean>(false);
  const [showAdminAccountModal, setShowAdminAccountModal] = useState<boolean>(false);

  // Auto save to localStorage
  useEffect(() => {
    saveStoredData(appState);
  }, [appState]);

  // Save auth user state
  useEffect(() => {
    if (authUser) {
      localStorage.setItem('classio_auth_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('classio_auth_user');
    }
  }, [authUser]);

  // Active Class & Student resolution
  const currentClass = appState.classes.find((c) => c.id === appState.currentClassId) || appState.classes[0];
  const classStudents = appState.students.filter((s) => s.classId === currentClass.id);
  const currentStudent = appState.students.find((s) => s.id === currentStudentId) || appState.students[0];

  // Countdown Timer Hook
  useEffect(() => {
    if (sessionDurationMinutes === 0 || isPaused || isExpired) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionDurationMinutes, isPaused, isExpired]);

  // Dynamic Token Generator (Anti-screenshot)
  const handleManualRefresh = () => {
    if (!appState.activeSession) return;
    const newToken = 'token_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    setAppState((prev) => {
      if (!prev.activeSession) return prev;
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          qrToken: newToken,
        },
      };
    });
  };

  // Change Session Duration
  const handleSessionDurationChange = (minutes: number) => {
    setSessionDurationMinutes(minutes);
    if (minutes === 0) {
      setRemainingSeconds(0);
      setIsExpired(false);
      setIsPaused(false);
    } else {
      const secs = minutes * 60;
      setRemainingSeconds(secs);
      setIsExpired(false);
      setIsPaused(false);
    }

    if (appState.activeSession) {
      setAppState((prev) => {
        if (!prev.activeSession) return prev;
        return {
          ...prev,
          activeSession: {
            ...prev.activeSession,
            durationMinutes: minutes,
            qrExpiredAt: minutes === 0 ? Date.now() + 86400000 : Date.now() + minutes * 60 * 1000,
          },
        };
      });
    }
  };

  const handleSessionTimeAdjust = (seconds: number) => {
    setIsExpired(false);
    setIsPaused(false);
    setRemainingSeconds((prev) => prev + seconds);
  };

  // Student Status Cycling
  const handleCycleStudentStatus = (studentId: string) => {
    const cycleMap: Record<AttendanceStatus, AttendanceStatus> = {
      present: 'late',
      late: 'leave',
      leave: 'absent',
      absent: 'present',
      pending: 'present',
    };

    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((st) => {
        if (st.id === studentId) {
          const nextStatus = cycleMap[st.status] || 'present';
          const currentTime = new Date().toTimeString().substring(0, 5);
          return {
            ...st,
            status: nextStatus,
            time: nextStatus === 'present' ? currentTime : (nextStatus === 'absent' ? '--:--' : (nextStatus === 'late' ? currentTime : '事假')),
          };
        }
        return st;
      }),
    }));
  };

  // Student QR Scan Success
  const handleCheckInSuccess = (studentId: string, timeStr: string) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((st) => {
        if (st.id === studentId) {
          return {
            ...st,
            status: 'present',
            time: timeStr,
          };
        }
        return st;
      }),
    }));
  };

  // End Roll Call Session
  const handleEndSession = () => {
    if (!appState.activeSession) return;
    if (!window.confirm('確定結束本次課堂點名嗎？所有未簽到的同學將自動標記為缺席。')) {
      return;
    }

    const nowTime = new Date().toTimeString().substring(0, 5);
    const updatedStudents = appState.students.map((st) => {
      if (st.classId === currentClass.id && (st.status === 'pending' || st.status === 'absent')) {
        return {
          ...st,
          status: 'absent' as AttendanceStatus,
          time: '--:--',
        };
      }
      return st;
    });

    const present = updatedStudents.filter((s) => s.classId === currentClass.id && s.status === 'present').length;
    const late = updatedStudents.filter((s) => s.classId === currentClass.id && s.status === 'late').length;
    const leave = updatedStudents.filter((s) => s.classId === currentClass.id && s.status === 'leave').length;
    const absent = updatedStudents.filter((s) => s.classId === currentClass.id && s.status === 'absent').length;

    const newHistory: HistorySession = {
      id: 'h_' + Date.now(),
      sessionId: appState.activeSession.sessionId,
      date: appState.activeSession.date,
      course: appState.activeSession.courseName,
      className: currentClass.name,
      startTime: appState.activeSession.startTime,
      endTime: nowTime,
      present,
      late,
      leave,
      absent,
      total: classStudents.length,
      records: [],
    };

    setAppState((prev) => ({
      ...prev,
      students: updatedStudents,
      history: [newHistory, ...prev.history],
      activeSession: {
        ...prev.activeSession!,
        endTime: nowTime,
        status: 'ended',
      },
    }));

    setIsExpired(true);
    setShowEndSessionSummary(true);
  };

  // Class Management (新增與刪減班級)
  const handleAddClass = (name: string, dept: string, grade: string) => {
    const newClassId = 'class_' + Date.now();
    const newClass = {
      id: newClassId,
      name,
      course: '',
      department: dept,
      grade,
      count: 0,
    };
    setAppState((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
      currentClassId: newClassId,
    }));
    alert(`已成功建立「${name}」班級！`);
  };

  const handleDeleteClass = (classId: string, className: string) => {
    if (appState.classes.length <= 1) {
      alert('系統中至少需保留一個班級，無法刪除！');
      return;
    }

    if (window.confirm(`確定要刪減/刪除「${className}」班級課程嗎？\n⚠️ 該班級的所有修課學生名單、簽到與作業紀錄將一併移除！`)) {
      setAppState((prev) => {
        const remainingClasses = prev.classes.filter((c) => c.id !== classId);
        const newCurrentClassId = prev.currentClassId === classId ? remainingClasses[0].id : prev.currentClassId;
        return {
          ...prev,
          classes: remainingClasses,
          currentClassId: newCurrentClassId,
          students: prev.students.filter((s) => s.classId !== classId),
          assignments: prev.assignments.filter((a) => a.classId !== classId),
        };
      });
      alert(`已成功刪除「${className}」班級課程！`);
    }
  };

  // Administrator Account & Password Management (管理者端帳號密碼修改)
  const handleSaveAdminCredentials = (newAccount: string, newPassword: string, newName: string) => {
    const updated = {
      account: newAccount,
      password: newPassword,
      name: newName,
    };
    setAppState((prev) => ({
      ...prev,
      adminCredentials: updated,
    }));
    setAuthUser({
      role: 'admin',
      account: newAccount,
      name: newName,
    });
    alert(`管理者帳號與密碼修改成功！\n登入帳號：${newAccount}\n登入密碼：${newPassword}\n下次登入時請以此新帳號與密碼登入。`);
  };

  // Student Password Change (學生端僅能改密碼)
  const handleStudentChangePassword = (newPassword: string) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === currentStudent.id ? { ...s, password: newPassword } : s
      ),
    }));
    alert(`學生 ${currentStudent.name} (${currentStudent.no}) 密碼已成功更新！\n下次登入請使用新密碼。`);
  };

  // Student Management & Credentials
  const handleAddStudent = (no: string, name: string, email: string, password?: string) => {
    const defaultPassword = password || 'password123';
    const newStudent: Student = {
      id: 's_' + Date.now(),
      no,
      name,
      email,
      password: defaultPassword,
      status: 'pending',
      time: '--:--',
      attendanceRate: '100%',
      accountStatus: 'active',
      classId: currentClass.id,
    };
    setAppState((prev) => ({
      ...prev,
      students: [...prev.students, newStudent],
    }));
    alert(`已為學生 ${name} (${no}) 建立帳號！\n學生登入學號：${no}\n預設密碼：${defaultPassword}\n該學生現在可以使用此帳號登入系統！`);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
  };

  const handleSaveEditStudent = (name: string, no: string, status: 'active' | 'suspended', password?: string) => {
    if (!editingStudent) return;
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            name,
            no,
            accountStatus: status,
            password: password || s.password || 'password123',
          };
        }
        return s;
      }),
    }));
    setEditingStudent(null);
    alert(`已成功更新學生 ${name} (${no}) 的學生帳號與登入資料！`);
  };

  const handleResetPassword = (student: Student) => {
    const newPwd = window.prompt(`請輸入學生 ${student.name} (${student.no}) 的新登入密碼：`, student.password || 'password123');
    if (newPwd === null) return;
    const finalPwd = newPwd.trim() || 'password123';
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) => s.id === student.id ? { ...s, password: finalPwd } : s),
    }));
    alert(`已將學生 ${student.name} (${student.no}) 的登入密碼修改為：${finalPwd}`);
  };

  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (window.confirm(`確定將學生「${studentName}」自本班名冊中刪除嗎？\n⚠️ 刪除後該學生帳號將被移除，學生將無法再以此帳號登入系統！`)) {
      setAppState((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s.id !== studentId),
      }));
      // If the deleted student happens to be the currently logged-in student, log out
      if (authUser?.role === 'student' && authUser.studentId === studentId) {
        setAuthUser(null);
      }
    }
  };

  // Assignment Management
  const handleAddAssignment = (title: string, due: string, description: string) => {
    const newId = 'a_' + Date.now();
    const newAssignment = {
      id: newId,
      classId: currentClass.id,
      courseName: currentClass.course || currentClass.name,
      title,
      due,
      description,
      status: 'active' as const,
      unsubmittedList: classStudents.map((s) => `${s.name} (${s.no})`),
      createdAt: Date.now(),
    };

    const newSubmissions = classStudents.map((s) => ({
      id: `sub_${newId}_${s.id}`,
      assignmentId: newId,
      studentId: s.id,
      studentNo: s.no,
      studentName: s.name,
      isSubmitted: false,
      remindedCount: 0,
    }));

    setAppState((prev) => ({
      ...prev,
      assignments: [newAssignment, ...prev.assignments],
      submissions: [...newSubmissions, ...prev.submissions],
    }));

    alert(`已發布作業「${title}」並建立催繳追蹤名冊！`);
  };

  const handleToggleSubmission = (submissionId: string) => {
    setAppState((prev) => ({
      ...prev,
      submissions: prev.submissions.map((sub) => {
        if (sub.id === submissionId) {
          const next = !sub.isSubmitted;
          return {
            ...sub,
            isSubmitted: next,
            submittedAt: next ? Date.now() : undefined,
          };
        }
        return sub;
      }),
    }));
  };

  const handleSendDunningReminder = (assignmentId: string, reminderNote: string) => {
    const now = Date.now();
    setAppState((prev) => ({
      ...prev,
      submissions: prev.submissions.map((sub) => {
        if (sub.assignmentId === assignmentId && !sub.isSubmitted) {
          return {
            ...sub,
            remindedCount: sub.remindedCount + 1,
            lastRemindedAt: now,
            reminderMessage: reminderNote,
          };
        }
        return sub;
      }),
    }));
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAppState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== assignmentId),
      submissions: prev.submissions.filter((s) => s.assignmentId !== assignmentId),
    }));
  };

  // Student submitting their own assignment
  const handleStudentSubmitAssignment = (submissionId: string) => {
    setAppState((prev) => ({
      ...prev,
      submissions: prev.submissions.map((sub) => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            isSubmitted: true,
            submittedAt: Date.now(),
          };
        }
        return sub;
      }),
    }));
    alert('作業已成功標記繳交完成！');
  };

  // Reset to default seed
  const handleResetData = () => {
    const freshState: AppStateData = {
      classes: initialClasses,
      currentClassId: 'class_01',
      students: initialStudents,
      assignments: initialAssignments,
      submissions: initialSubmissions,
      history: initialHistorySessions,
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
      },
    };
    setAppState(freshState);
    saveStoredData(freshState);
    setRemainingSeconds(300);
    setIsExpired(false);
    setIsPaused(false);
  };

  const pendingAssignmentTotal = appState.assignments.reduce((acc, a) => {
    const unsubmitted = appState.submissions.filter(s => s.assignmentId === a.id && !s.isSubmitted).length;
    return acc + unsubmitted;
  }, 0);

  const handleLogout = () => {
    setAuthUser(null);
  };

  // If user is not authenticated, display the login portal
  if (!authUser) {
    return (
      <LoginScreen
        students={appState.students}
        adminCredentials={appState.adminCredentials || defaultAdminCredentials}
        onLoginSuccess={(user) => {
          setAuthUser(user);
          setCurrentRole(user.role);
          if (user.studentId) {
            setCurrentStudentId(user.studentId);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        currentStudent={currentStudent}
        students={appState.students}
        activeAdminTab={activeAdminTab}
        onRoleChange={(role, studentId) => {
          if (role === 'admin') {
            setAuthUser({
              role: 'admin',
              account: 'admin',
              name: '陳教授 (系統管理員)',
            });
            setCurrentRole('admin');
          } else {
            const targetId = studentId || currentStudentId;
            const st = appState.students.find((s) => s.id === targetId) || appState.students[0];
            if (st) {
              setAuthUser({
                role: 'student',
                account: st.no,
                name: st.name,
                studentId: st.id,
              });
              setCurrentRole('student');
              setCurrentStudentId(st.id);
            }
          }
        }}
        onAdminTabChange={setActiveAdminTab}
        onResetData={handleResetData}
        onLogout={handleLogout}
        pendingAssignmentCount={pendingAssignmentTotal}
        hasActiveSession={!!appState.activeSession && !isExpired}
      />

      {/* 2. Main Viewport Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col pb-16">
        {currentRole === 'admin' ? (
          <AdminDashboard
            currentClass={currentClass}
            students={classStudents}
            activeSession={appState.activeSession}
            activeAdminTab={activeAdminTab}
            onAdminTabChange={setActiveAdminTab}
            onOpenSwitchClass={() => setShowSwitchClass(true)}
            onOpenAddClass={() => setShowAddClass(true)}
            onOpenAdminAccountModal={() => setShowAdminAccountModal(true)}
            onOpenExportModal={() => {
              setExportingSession(appState.activeSession);
              setShowExportModal(true);
            }}
            onOpenProjector={() => setShowProjector(true)}
            onEndSession={handleEndSession}
            onSessionDurationChange={handleSessionDurationChange}
            onSessionTimeAdjust={handleSessionTimeAdjust}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            remainingSeconds={remainingSeconds}
            totalDurationSeconds={sessionDurationMinutes * 60}
            isExpired={isExpired}
            refreshInterval={refreshInterval}
            onRefreshIntervalChange={setRefreshInterval}
            onManualRefresh={handleManualRefresh}
            onCycleStudentStatus={handleCycleStudentStatus}
            onOpenAddStudent={() => setShowAddStudent(true)}
            onEditStudent={handleEditStudent}
            onResetPassword={handleResetPassword}
            onDeleteStudent={handleDeleteStudent}
            assignments={appState.assignments.filter(a => a.classId === currentClass.id)}
            submissions={appState.submissions}
            onOpenAddAssignment={() => setShowAddAssignment(true)}
            onToggleSubmission={handleToggleSubmission}
            onSendDunningReminder={handleSendDunningReminder}
            onDeleteAssignment={handleDeleteAssignment}
            history={appState.history}
            onExportHistorySession={(session) => {
              setExportingSession({
                sessionId: session.sessionId,
                classId: currentClass.id,
                courseName: session.course,
                date: session.date,
                startTime: session.startTime,
                endTime: session.endTime,
                qrToken: 'hist_token',
                qrExpiredAt: 0,
                status: 'ended',
                durationMinutes: 10,
              });
              setShowExportModal(true);
            }}
          />
        ) : (
          <StudentPortal
            student={currentStudent}
            currentClass={currentClass}
            activeSession={appState.activeSession}
            remainingSeconds={remainingSeconds}
            isSessionExpired={isExpired}
            assignments={appState.assignments}
            submissions={appState.submissions}
            onCheckInSuccess={handleCheckInSuccess}
            onStudentSubmitAssignment={handleStudentSubmitAssignment}
            onChangePassword={handleStudentChangePassword}
          />
        )}
      </main>

      {/* 3. Fullscreen Classroom Projector Mode */}
      {showProjector && appState.activeSession && (
        <FullscreenProjector
          session={appState.activeSession}
          students={classStudents}
          onClose={() => setShowProjector(false)}
          onSessionDurationChange={handleSessionDurationChange}
          onSessionTimeAdjust={handleSessionTimeAdjust}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          remainingSeconds={remainingSeconds}
          isExpired={isExpired}
          refreshInterval={refreshInterval}
        />
      )}

      {/* 4. Export Modal */}
      {showExportModal && exportingSession && (
        <ExportModal
          session={exportingSession}
          className={currentClass.name}
          students={classStudents}
          onClose={() => {
            setShowExportModal(false);
            setExportingSession(null);
          }}
        />
      )}

      {/* 5. Switch Class Modal (新增與刪減班級) */}
      {showSwitchClass && (
        <SwitchClassModal
          classes={appState.classes}
          selectedClassId={appState.currentClassId}
          onSelectClass={(classId) => {
            setAppState((prev) => ({ ...prev, currentClassId: classId }));
          }}
          onOpenAddClass={() => setShowAddClass(true)}
          onDeleteClass={handleDeleteClass}
          onClose={() => setShowSwitchClass(false)}
        />
      )}

      {/* 6. Add Class Modal */}
      {showAddClass && (
        <AddClassModal
          onClose={() => setShowAddClass(false)}
          onConfirm={handleAddClass}
        />
      )}

      {/* 7. Add Student Modal */}
      {showAddStudent && (
        <AddStudentModal
          onClose={() => setShowAddStudent(false)}
          onConfirm={handleAddStudent}
        />
      )}

      {/* 8. Edit Student Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onConfirm={handleSaveEditStudent}
        />
      )}

      {/* 9. Add Assignment Modal */}
      {showAddAssignment && (
        <AddAssignmentModal
          onClose={() => setShowAddAssignment(false)}
          onConfirm={handleAddAssignment}
        />
      )}

      {/* 10. End Session Summary Modal */}
      {showEndSessionSummary && appState.activeSession && (
        <EndSessionSummaryModal
          session={appState.activeSession}
          students={classStudents}
          onOpenExport={() => {
            setExportingSession(appState.activeSession);
            setShowExportModal(true);
          }}
          onClose={() => setShowEndSessionSummary(false)}
        />
      )}

      {/* 11. Admin Account & Password Modal (管理者端帳號密碼修改) */}
      {showAdminAccountModal && (
        <AdminAccountModal
          currentCredentials={appState.adminCredentials || defaultAdminCredentials}
          onClose={() => setShowAdminAccountModal(false)}
          onConfirm={handleSaveAdminCredentials}
        />
      )}
    </div>
  );
}
