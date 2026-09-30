import React, { useState, useEffect, useRef } from 'react';
import { Student, AttendanceSession, Assignment, AssignmentSubmission, ClassItem } from '../types';
import { formatSecondsToMMSS, parseQRCodePayload } from '../utils/qrUtil';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import { CheckInSuccessModal, CheckInSuccessDetails } from './CheckInSuccessModal';
import { StudentChangePasswordModal } from './Modals';
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  QrCode, 
  Calendar, 
  StopCircle, 
  Wifi, 
  WifiOff,
  User,
  School,
  X,
  Sparkles,
  KeyRound
} from 'lucide-react';

interface StudentPortalProps {
  student: Student;
  currentClass: ClassItem;
  activeSession: AttendanceSession | null;
  remainingSeconds: number;
  isSessionExpired: boolean;
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  onCheckInSuccess: (studentId: string, timeStr: string) => void;
  onStudentSubmitAssignment: (submissionId: string) => void;
  onChangePassword?: (newPassword: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  currentClass,
  activeSession,
  remainingSeconds,
  isSessionExpired,
  assignments,
  submissions,
  onCheckInSuccess,
  onStudentSubmitAssignment,
  onChangePassword,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<{ course: string; time: string } | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [scanAlertSuccess, setScanAlertSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successDetails, setSuccessDetails] = useState<CheckInSuccessDetails | null>(null);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Student submissions
  const mySubmissions = submissions.filter((sub) => sub.studentId === student.id);
  const myUnsubmitted = mySubmissions.filter((sub) => !sub.isSubmitted);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setScannerError(null);
    setIsScanning(true);

    try {
      const qrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = qrCode;

      await qrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          stopScanner();
          handleScannedContent(decodedText);
        },
        () => {
          // ignore scan frame error
        }
      );
    } catch (err: any) {
      console.error('Camera start error', err);
      setIsScanning(false);
      setScannerError('無法啟動相機。請確認已允許攝影機權限，或使用下方的「一鍵模擬掃碼簽到」進行測試。');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Stop scanner error', err);
      }
    }
    setIsScanning(false);
  };

  const handleScannedContent = (rawText: string) => {
    if (isOffline) {
      alert('【簽到失敗】：目前處於離線狀態，請連接網路後再試！');
      return;
    }

    const payload = parseQRCodePayload(rawText);
    if (!payload) {
      alert('【簽到失敗】：無效或無法辨識的 QR Code！');
      return;
    }

    if (!activeSession) {
      alert('【簽到失敗】：目前沒有進行中的點名活動！');
      return;
    }

    if (payload.classId !== student.classId) {
      alert(`【簽到失敗】：此 QR Code 屬於其他班級，與您的班級 (${currentClass.name}) 不符合！`);
      return;
    }

    if (isSessionExpired || Date.now() > payload.expiredAt) {
      alert('【簽到失敗】：此 QR Code 已經逾期失效，無法簽到！');
      return;
    }

    if (student.status === 'present') {
      alert(`【重複簽到】：同學您已於 ${student.time} 完成簽到，無須重複掃碼！`);
      return;
    }

    // Open confirmation modal
    const currentTimeStr = new Date().toTimeString().substring(0, 5);
    setScannedData({
      course: payload.courseName,
      time: currentTimeStr,
    });
    setShowConfirmModal(true);
  };

  const handleConfirmCheckIn = () => {
    if (!scannedData) return;
    onCheckInSuccess(student.id, scannedData.time);
    setShowConfirmModal(false);

    // Fire celebration confetti!
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    const details: CheckInSuccessDetails = {
      studentName: student.name,
      studentNo: student.no,
      courseName: scannedData.course,
      className: currentClass.name,
      checkInTime: scannedData.time,
      dateStr: activeSession?.date || new Date().toISOString().substring(0, 10),
    };

    setSuccessDetails(details);
    setShowSuccessModal(true);
    setScanAlertSuccess(`簽到成功！${student.name} (${student.no}) 於 ${scannedData.time} 完成課堂簽到`);
    setTimeout(() => setScanAlertSuccess(null), 8000);
  };

  const handleSimulateScan = () => {
    if (!activeSession) {
      alert('目前教師尚未開啟點名場次！');
      return;
    }
    const simulatedRaw = JSON.stringify({
      sessionId: activeSession.sessionId,
      classId: activeSession.classId,
      courseName: activeSession.courseName,
      date: activeSession.date,
      startTime: activeSession.startTime,
      token: activeSession.qrToken,
      ts: Date.now(),
      expiredAt: activeSession.qrExpiredAt,
    });
    handleScannedContent(simulatedRaw);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Student Profile Gradient Banner */}
      <div className="bg-gradient-to-r from-[#182B49] via-[#1E3A8A] to-[#2563EB] rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <BrandLogo size="lg" />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black">{student.name}</h2>
              <span className="bg-white/20 text-blue-100 text-xs px-2.5 py-0.5 rounded-full font-mono-numbers font-bold">
                {student.no}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1 font-medium">
              {currentClass.department} · {currentClass.name} ({currentClass.grade})
            </p>
          </div>
        </div>

        {/* Attendance Rate, Password Change & Network Simulator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowChangePassword(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition flex items-center space-x-1.5 text-white cursor-pointer shadow-xs"
            title="修改個人登入密碼 (僅限改密碼，不可修改學號)"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-300" />
            <span>修改個人密碼</span>
          </button>

          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 ${
              isOffline
                ? 'bg-red-500/30 border-red-400 text-red-200'
                : 'bg-white/10 border-white/20 text-emerald-300'
            }`}
            title="模擬網路連線狀態切換"
          >
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span>{isOffline ? '離線狀態' : '連線正常'}</span>
          </button>

          <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
            <div>
              <span className="text-[10px] text-blue-200 block font-bold">累計出席率</span>
              <span className="text-xl font-black text-emerald-300 font-mono-numbers">
                {student.attendanceRate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending / Missing Assignment Notification Card */}
      {myUnsubmitted.length > 0 ? (
        <div className="bg-amber-50/90 border-l-4 border-amber-500 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start space-x-3.5">
              <div className="text-amber-600 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-amber-900">
                    作業催繳提醒：您有 {myUnsubmitted.length} 份作業尚未繳交
                  </h4>
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    請速補交
                  </span>
                </div>

                <div className="mt-2 space-y-2">
                  {myUnsubmitted.map((sub) => {
                    const assign = assignments.find((a) => a.id === sub.assignmentId);
                    return (
                      <div key={sub.id} className="text-xs text-amber-800 bg-white/60 p-2.5 rounded-xl border border-amber-200/60">
                        <div className="font-bold text-slate-800">{assign?.title}</div>
                        <div className="text-[11px] text-amber-700 font-mono-numbers mt-0.5">
                          截止時間：{assign?.due}
                        </div>
                        {sub.reminderMessage && (
                          <div className="text-[11px] text-red-600 mt-1 font-semibold">
                            老師催繳備註：{sub.reminderMessage}
                          </div>
                        )}
                        <button
                          onClick={() => onStudentSubmitAssignment(sub.id)}
                          className="mt-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>標記為已繳交 (完成補交)</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4 flex items-center space-x-3 text-emerald-800 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>您所有的作業均已準時完成繳交，目前沒有任何待繳項目！</span>
        </div>
      )}

      {/* Live Roll Call Session Banner */}
      {activeSession ? (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900">{activeSession.courseName} · 正在點名中</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center ${
                  isSessionExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isSessionExpired ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                  {isSessionExpired ? '已截止' : '開放簽到中'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                請點擊下方相機按鈕掃描課堂大螢幕 QR 碼簽到
              </p>
            </div>
          </div>

          <div className="text-right pl-3 shrink-0">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">剩餘時間</span>
            <span className={`text-xl font-black font-mono-numbers leading-tight ${
              isSessionExpired ? 'text-red-600' : 'text-blue-600'
            }`}>
              {activeSession.durationMinutes === 0 ? '不限時' : formatSecondsToMMSS(remainingSeconds)}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 rounded-2xl p-4 text-center text-xs text-slate-500">
          目前課堂尚未發布點名場次，老師開啟點名時系統將即時通知。
        </div>
      )}

      {/* Camera QR Scanner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-2">
          <Camera className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-900">相機掃描課堂 QR Code</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm">
          支援各型號智慧型手機 (iOS Safari、Android Chrome) 或筆電鏡頭直接掃碼簽到。
        </p>

        {/* Camera Viewport Box */}
        <div className="w-full max-w-xs aspect-square bg-slate-900 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center shadow-inner border-4 border-slate-800">
          <div id="qr-reader-container" className="w-full h-full" />

          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center bg-slate-900/90">
              <QrCode className="w-16 h-16 text-blue-400 mb-3" />
              <span className="text-xs font-bold text-slate-200">相機鏡頭已就緒</span>
              <span className="text-[11px] text-slate-400 mt-1">點擊下方按鈕啟動相機掃描</span>
            </div>
          )}
        </div>

        {scannerError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 max-w-sm">
            {scannerError}
          </div>
        )}

        {/* Scanner Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {!isScanning ? (
            <button
              onClick={startScanner}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-blue-500/20"
            >
              <Camera className="w-4 h-4" />
              <span>啟動相機鏡頭掃描</span>
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="px-6 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition flex items-center space-x-2"
            >
              <StopCircle className="w-4 h-4" />
              <span>關閉相機</span>
            </button>
          )}

          <button
            onClick={handleSimulateScan}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>一鍵模擬掃碼簽到 (測試用)</span>
          </button>
        </div>

        {/* Scan Success Banner with Framer Motion Fade In/Out */}
        <AnimatePresence>
          {scanAlertSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-6 w-full max-w-md bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 rounded-3xl p-4 sm:p-5 text-left flex items-start justify-between space-x-3.5 shadow-lg shadow-emerald-500/10"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-black text-emerald-950">簽到成功！</h4>
                    <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                      已雲端同步
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">{scanAlertSuccess}</p>
                </div>
              </div>

              {successDetails && (
                <button
                  onClick={() => setShowSuccessModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shrink-0 cursor-pointer shadow-xs"
                >
                  查看收執
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && scannedData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span>確認簽到資訊</span>
            </h3>

            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">課程名稱：</span>
                <span className="font-bold text-slate-800">{scannedData.course}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">所屬班級：</span>
                <span className="font-bold text-slate-800">{currentClass.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">學生姓名：</span>
                <span className="font-bold text-slate-800">{student.name} ({student.no})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">簽到時間：</span>
                <span className="font-bold text-emerald-700 font-mono-numbers">{scannedData.time}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleConfirmCheckIn}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
              >
                確認送出簽到
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Attendance Records */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>個人課堂出缺席紀錄</span>
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800">
                {activeSession?.date || '2026/09/30'} · {activeSession?.courseName || '計算機組織'}
              </div>
              <div className="text-xs text-slate-400 font-mono-numbers mt-0.5">
                簽到時間：{student.status === 'present' ? student.time : '--:--'} (動態 QR Code)
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full font-bold ${
              student.status === 'present' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {student.status === 'present' ? '已出席' : '尚未簽到'}
            </span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800">2026/09/29 · 計算機組織</div>
              <div className="text-xs text-slate-400 font-mono-numbers mt-0.5">簽到時間：08:12 (動態 QR Code)</div>
            </div>
            <span className="px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              出席
            </span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800">2026/09/22 · 計算機組織</div>
              <div className="text-xs text-slate-400 font-mono-numbers mt-0.5">簽到時間：08:24 (遲到 14 分鐘)</div>
            </div>
            <span className="px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
              遲到
            </span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800">2026/09/15 · 計算機組織</div>
              <div className="text-xs text-slate-400 font-mono-numbers mt-0.5">簽到時間：08:10 (動態 QR Code)</div>
            </div>
            <span className="px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              出席
            </span>
          </div>
        </div>
      </div>

      {/* Exquisite Check-In Success Modal with Framer Motion Fade In/Out */}
      <CheckInSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        details={successDetails}
      />

      {/* Student Change Password Modal (學生端僅能改密碼) */}
      {showChangePassword && (
        <StudentChangePasswordModal
          student={student}
          onClose={() => setShowChangePassword(false)}
          onConfirm={(newPassword) => {
            if (onChangePassword) {
              onChangePassword(newPassword);
            }
          }}
        />
      )}
    </div>
  );
};
