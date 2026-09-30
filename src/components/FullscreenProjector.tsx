import React, { useEffect, useState } from 'react';
import { AttendanceSession, Student } from '../types';
import { generateQRCodeDataUrl, formatSecondsToMMSS } from '../utils/qrUtil';
import { BrandLogo } from './BrandLogo';
import { 
  X, 
  Hourglass, 
  Plus, 
  Pause, 
  Play, 
  RotateCw, 
  Lock, 
  Timer,
  CheckCircle2, 
  Users
} from 'lucide-react';

interface FullscreenProjectorProps {
  session: AttendanceSession;
  students: Student[];
  onClose: () => void;
  onSessionDurationChange: (minutes: number) => void;
  onSessionTimeAdjust: (seconds: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  remainingSeconds: number;
  isExpired: boolean;
  refreshInterval: number;
}

export const FullscreenProjector: React.FC<FullscreenProjectorProps> = ({
  session,
  students,
  onClose,
  onSessionDurationChange,
  onSessionTimeAdjust,
  isPaused,
  onTogglePause,
  remainingSeconds,
  isExpired,
  refreshInterval,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tickerCount, setTickerCount] = useState<number>(refreshInterval || 10);

  useEffect(() => {
    let isSubscribed = true;
    generateQRCodeDataUrl({
      sessionId: session.sessionId,
      classId: session.classId,
      courseName: session.courseName,
      date: session.date,
      startTime: session.startTime,
      token: session.qrToken,
      ts: Date.now(),
      expiredAt: session.qrExpiredAt,
    }).then((url) => {
      if (isSubscribed) setQrDataUrl(url);
    });
    return () => {
      isSubscribed = false;
    };
  }, [session.sessionId, session.qrToken, session.courseName]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Interval ticker
  useEffect(() => {
    if (refreshInterval === 0 || isPaused || isExpired) return;
    setTickerCount(refreshInterval);
    const interval = setInterval(() => {
      setTickerCount((prev) => (prev <= 1 ? refreshInterval : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshInterval, session.qrToken, isPaused, isExpired]);

  const totalCount = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const absentCount = students.filter(s => s.status === 'absent').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center select-none overflow-y-auto">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
        title="關閉全螢幕 (Esc)"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="max-w-2xl w-full flex flex-col items-center my-auto">
        {/* Projector Top Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/15 text-xs font-bold shadow-lg">
          <span className="text-slate-300 mr-1 flex items-center gap-1">
            <Timer className="w-4 h-4 text-amber-400" />
            <span>時效設定：</span>
          </span>
          {[1, 3, 5, 10].map((mins) => (
            <button
              key={mins}
              onClick={() => onSessionDurationChange(mins)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                session.durationMinutes === mins ? 'bg-blue-600 text-white shadow' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {mins}分
            </button>
          ))}
          <button
            onClick={() => onSessionDurationChange(0)}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              session.durationMinutes === 0 ? 'bg-blue-600 text-white shadow' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            無限制
          </button>
          <div className="h-4 w-px bg-white/20 mx-1" />
          <button
            onClick={() => onSessionTimeAdjust(60)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white flex items-center gap-1 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>1分</span>
          </button>
          {session.durationMinutes > 0 && (
            <button
              onClick={onTogglePause}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition cursor-pointer"
            >
              {isPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3" />}
              <span>{isPaused ? '繼續' : '暫停'}</span>
            </button>
          )}
        </div>

        {/* Course Title with Official Brand Logo */}
        <div className="flex items-center space-x-3.5 mb-1">
          <BrandLogo size="md" />
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {session.courseName}
          </h2>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mb-4">
          請開啟手機瀏覽器或相機，掃描下方動態 QR Code 進行課堂簽到
        </p>

        {/* Big Countdown Clock Banner */}
        <div className="my-2 px-6 py-2.5 rounded-full bg-slate-900 border-2 border-amber-400/80 shadow-2xl flex items-center space-x-3 backdrop-blur-md">
          <Hourglass className="w-6 h-6 text-amber-400 animate-pulse" />
          <span className="text-slate-300 text-sm font-semibold">簽到剩餘時間：</span>
          <span className="font-mono-numbers text-3xl sm:text-4xl font-black text-amber-400 tracking-wider">
            {session.durationMinutes === 0 ? '不限時' : formatSecondsToMMSS(remainingSeconds)}
          </span>
        </div>

        {/* Projector QR Container */}
        <div className="p-6 bg-white rounded-3xl shadow-2xl border-8 border-slate-800 relative overflow-hidden my-4">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="投影機 QR 碼"
              className="w-72 h-72 sm:w-80 sm:h-80 object-contain"
            />
          ) : (
            <div className="w-72 h-72 flex items-center justify-center text-slate-400">生成中...</div>
          )}

          {/* Expired Overlay */}
          {isExpired && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-3xl mb-3">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-red-400">點名時間已截止</h3>
              <p className="text-xs text-slate-300 mt-1 mb-5">QR Code 已過期鎖定，請洽授權人員</p>
              <button
                onClick={() => onSessionTimeAdjust(180)}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg transition flex items-center space-x-2 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>延長點名 3 分鐘</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Counters HUD */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-slate-300 text-sm font-bold font-mono-numbers">
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span>應到：<span className="text-white text-base">{totalCount}</span> 人</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>已出席：<span className="text-emerald-400 text-base">{presentCount}</span> 人</span>
          </div>
          <div>
            遲到：<span className="text-amber-400 text-base">{lateCount}</span> 人
          </div>
          <div>
            缺席：<span className="text-red-400 text-base">{absentCount}</span> 人
          </div>
          {refreshInterval > 0 && !isExpired && (
            <div className="text-blue-400 flex items-center space-x-1">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>動態更新：{tickerCount}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
