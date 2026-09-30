import React, { useState, useEffect } from 'react';
import { AttendanceSession, Student } from '../types';
import { generateQRCodeDataUrl, formatSecondsToMMSS } from '../utils/qrUtil';
import { 
  Hourglass, 
  RotateCw, 
  Maximize2, 
  Pause, 
  Play, 
  Plus, 
  Lock, 
  StopCircle, 
  ShieldCheck, 
  Timer,
  Edit2
} from 'lucide-react';

interface DynamicQRSectionProps {
  session: AttendanceSession;
  students: Student[];
  onOpenProjector: () => void;
  onEndSession: () => void;
  onSessionDurationChange: (minutes: number) => void;
  onSessionTimeAdjust: (seconds: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  remainingSeconds: number;
  totalDurationSeconds: number;
  isExpired: boolean;
  refreshInterval: number; // in seconds, 0 = no auto refresh
  onRefreshIntervalChange: (interval: number) => void;
  onManualRefresh: () => void;
}

export const DynamicQRSection: React.FC<DynamicQRSectionProps> = ({
  session,
  students,
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
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tickerCount, setTickerCount] = useState<number>(refreshInterval || 10);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customMinutesInput, setCustomMinutesInput] = useState<number>(8);

  // Generate QR image whenever session or token changes
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

  // Interval ticker countdown
  useEffect(() => {
    if (refreshInterval === 0 || isPaused || isExpired) return;
    setTickerCount(refreshInterval);
    const interval = setInterval(() => {
      setTickerCount((prev) => {
        if (prev <= 1) {
          onManualRefresh();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshInterval, session.qrToken, isPaused, isExpired, onManualRefresh]);

  // Attendance stats
  const totalCount = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const absentCount = students.filter(s => s.status === 'absent').length;

  const progressPercent = totalDurationSeconds > 0 
    ? Math.max(0, Math.min(100, (remainingSeconds / totalDurationSeconds) * 100))
    : 100;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
      
      {/* Top Banner Status */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
          <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-500' : isPaused ? 'bg-amber-500' : 'bg-blue-600 animate-pulse'}`} />
          <span>{isExpired ? '點名時間已截止' : isPaused ? '點名暫停中' : '動態 QR Code 點名中'}</span>
        </div>

        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
          isExpired 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {isExpired ? '已過期鎖定' : '即時同步'}
        </span>
      </div>

      {/* Session Timer Configuration Card */}
      <div className="w-full bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200 mb-4 text-left shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <Timer className="w-4 h-4 text-blue-600" />
            <span>QR Code 顯示時效</span>
          </span>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200 font-mono-numbers">
            {session.durationMinutes === 0 ? '無時間限制' : `${session.durationMinutes} 分鐘模式`}
          </span>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {[1, 3, 5, 10, 15].map((mins) => (
            <button
              key={mins}
              onClick={() => onSessionDurationChange(mins)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                session.durationMinutes === mins
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
              }`}
            >
              {mins} 分
            </button>
          ))}
          <button
            onClick={() => onSessionDurationChange(0)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              session.durationMinutes === 0
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
            }`}
          >
            無限制
          </button>
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-2 py-1 rounded-lg text-xs font-bold bg-white hover:bg-blue-50 text-slate-600 border border-slate-200 transition flex items-center space-x-1"
            title="自訂分鐘"
          >
            <Edit2 className="w-3 h-3 text-slate-500" />
            <span>自訂</span>
          </button>
        </div>

        {/* Big Countdown Clock Display */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
              isExpired ? 'bg-red-50 text-red-600' : isPaused ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
            }`}>
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">剩餘時間</span>
              <span className={`text-2xl font-black font-mono-numbers leading-none ${
                isExpired ? 'text-red-600' : remainingSeconds <= 60 ? 'text-amber-600 animate-pulse' : 'text-slate-900'
              }`}>
                {session.durationMinutes === 0 ? '持續開放' : formatSecondsToMMSS(remainingSeconds)}
              </span>
            </div>
          </div>

          {/* Quick Adjust Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onSessionTimeAdjust(60)}
              title="延長 1 分鐘"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>1分</span>
            </button>
            <button
              onClick={() => onSessionTimeAdjust(300)}
              title="延長 5 分鐘"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>5分</span>
            </button>
            {session.durationMinutes > 0 && (
              <button
                onClick={onTogglePause}
                title={isPaused ? '繼續倒數' : '暫停倒數'}
                className="p-2 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-blue-600" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isExpired ? 'bg-red-500' : remainingSeconds <= 60 ? 'bg-amber-500' : 'bg-blue-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Dynamic Anti-Screenshot Refresh Interval */}
      <div className="w-full flex items-center justify-between text-xs mb-3 px-1 text-slate-600">
        <span className="font-bold flex items-center space-x-1.5 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>防截圖轉傳動態更新</span>
        </span>
        <select
          value={refreshInterval}
          onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
          className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 outline-none cursor-pointer"
        >
          <option value={5}>每 5 秒更新 (高安全性)</option>
          <option value={10}>每 10 秒更新 (標準推薦)</option>
          <option value={15}>每 15 秒更新</option>
          <option value={30}>每 30 秒更新</option>
          <option value={60}>每 60 秒更新</option>
          <option value={0}>固定不更新 (無防偽)</option>
        </select>
      </div>

      {/* QR Code Container with Expired Overlay */}
      <div className="p-4 bg-white rounded-3xl shadow-lg border-4 border-slate-100 flex items-center justify-center w-64 h-64 relative mb-4 overflow-hidden">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="點名動態 QR Code"
            className="w-56 h-56 object-contain"
          />
        ) : (
          <div className="text-xs text-slate-400">正在生成動態 QR Code...</div>
        )}

        {/* Ticker badge */}
        {refreshInterval > 0 && !isExpired && (
          <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-[11px] px-2.5 py-0.5 rounded-full font-mono-numbers flex items-center space-x-1 backdrop-blur-xs shadow-md">
            <RotateCw className="w-2.5 h-2.5 text-blue-300 animate-spin" />
            <span>{tickerCount}s</span>
          </div>
        )}

        {/* Expired Overlay */}
        {isExpired && (
          <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xl mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-red-200">點名已逾時截止</h4>
            <p className="text-[11px] text-slate-300 mt-1 mb-3">此 QR 碼已自動鎖定，學生無法再掃碼簽到</p>
            <button
              onClick={() => onSessionTimeAdjust(180)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>延長點名 3 分鐘</span>
            </button>
          </div>
        )}
      </div>

      {/* Controls Below QR */}
      <div className="w-full flex items-center justify-center space-x-2 mb-4">
        <button
          onClick={onManualRefresh}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5"
        >
          <RotateCw className="w-3.5 h-3.5 text-blue-600" />
          <span>立即更新 QR 碼</span>
        </button>
        <button
          onClick={onOpenProjector}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>全螢幕投影模式</span>
        </button>
      </div>

      {/* Live Attendance Numbers HUD */}
      <div className="w-full grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 font-mono-numbers">
        <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
          <span className="text-[11px] text-slate-500 font-semibold block">應到人數</span>
          <span className="text-lg font-black text-slate-800">{totalCount}</span>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-2xl text-center">
          <span className="text-[11px] text-emerald-700 font-semibold block">已出席</span>
          <span className="text-lg font-black text-emerald-700">{presentCount}</span>
        </div>
        <div className="bg-amber-50 p-2.5 rounded-2xl text-center">
          <span className="text-[11px] text-amber-700 font-semibold block">遲到</span>
          <span className="text-lg font-black text-amber-700">{lateCount}</span>
        </div>
        <div className="bg-red-50 p-2.5 rounded-2xl text-center">
          <span className="text-[11px] text-red-700 font-semibold block">缺席</span>
          <span className="text-lg font-black text-red-700">{absentCount}</span>
        </div>
      </div>

      {/* Stop Roll Call Button */}
      <button
        onClick={onEndSession}
        className="mt-4 w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center justify-center space-x-2"
      >
        <StopCircle className="w-4 h-4" />
        <span>結束本次點名並統計結算</span>
      </button>

      {/* Custom Duration Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl flex flex-col space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Timer className="w-5 h-5 text-blue-600" />
              <span>設定自訂點名時長</span>
            </h3>
            <p className="text-xs text-slate-500">
              設定本次點名 QR 碼有效倒數時間（分鐘）
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(Math.max(1, Number(e.target.value)))}
                className="flex-1 px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:border-blue-600 outline-none text-center text-xl font-bold font-mono-numbers"
              />
              <span className="text-sm font-bold text-slate-600">分鐘</span>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => {
                  onSessionDurationChange(customMinutesInput);
                  setShowCustomModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                套用
              </button>
              <button
                onClick={() => setShowCustomModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
