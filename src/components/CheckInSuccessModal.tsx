import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldCheck, Clock, Calendar, Sparkles, X, Check } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export interface CheckInSuccessDetails {
  studentName: string;
  studentNo: string;
  courseName: string;
  className: string;
  checkInTime: string;
  dateStr: string;
}

interface CheckInSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: CheckInSuccessDetails | null;
}

export const CheckInSuccessModal: React.FC<CheckInSuccessModalProps> = ({
  isOpen,
  onClose,
  details,
}) => {
  if (!details) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with Fade-in/out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Dialog Container with Spring Scale and Fade */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              opacity: { duration: 0.25 }
            }}
            className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-emerald-100 flex flex-col items-center text-center overflow-hidden z-10"
          >
            {/* Top ambient glow bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              title="關閉"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Animated Checkmark Circle with Staggered Pulse */}
            <div className="relative my-2 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 18,
                  delay: 0.1,
                }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30"
              >
                <Check className="w-10 h-10 stroke-[3.2]" />
              </motion.div>

              {/* Pulsing Ring Effect */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.35, opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: 'easeOut',
                }}
                className="absolute inset-0 rounded-3xl border-2 border-emerald-400 pointer-events-none"
              />
            </div>

            {/* Title & Subtitle with Fade */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-3"
            >
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>簽到成功 · 已紀錄至系統</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                出席簽到成功！
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                系統已成功驗證動態 QR 碼並完成學號綁定
              </p>
            </motion.div>

            {/* Attendance Receipt Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.35 }}
              className="w-full mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">學生姓名</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  {details.studentName}
                  <span className="font-mono-numbers text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                    {details.studentNo}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">所屬班級</span>
                <span className="font-semibold text-slate-800">{details.className}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">簽到科目</span>
                <span className="font-bold text-slate-900">{details.courseName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>簽到時間</span>
                </span>
                <span className="font-bold font-mono-numbers text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg text-sm">
                  {details.checkInTime}
                </span>
              </div>
            </motion.div>

            {/* Confirm Dismiss Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="w-full mt-5"
            >
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>我知道了 (完成)</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
