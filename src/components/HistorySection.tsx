import React, { useState } from 'react';
import { HistorySession } from '../types';
import { Clock, Calendar, CheckCircle2, AlertCircle, FileDown, ChevronRight, X } from 'lucide-react';

interface HistorySectionProps {
  history: HistorySession[];
  onExportSession: (session: HistorySession) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ history, onExportSession }) => {
  const [selectedHistory, setSelectedHistory] = useState<HistorySession | null>(null);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">歷史點名點名紀錄</h3>
          <p className="text-xs text-slate-500 mt-1">
            記錄過去所有課堂點名場次、出席率統計與異常紀錄，可再次檢視或匯出試算表。
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            尚無歷史紀錄
          </div>
        ) : (
          history.map((h) => {
            const rate = h.total > 0 ? Math.round(((h.present + h.late) / h.total) * 100) : 100;
            return (
              <div
                key={h.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 px-3 rounded-xl transition gap-3 cursor-pointer group"
                onClick={() => setSelectedHistory(h)}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {h.date} · {h.course}
                    </div>
                    <div className="text-xs text-slate-500 font-mono-numbers mt-0.5">
                      {h.className} · {h.startTime} ~ {h.endTime || '結束'} · 實到出席率 {rate}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 font-mono-numbers">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    出席 {h.present}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    遲到 {h.late}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-50 text-red-700 border border-red-200">
                    缺席 {h.absent}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportSession(h);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition ml-2"
                    title="匯出此場次報表"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* History Detail Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {selectedHistory.course} - 點名場次詳情
              </h3>
              <button
                onClick={() => setSelectedHistory(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">點名日期</span>
                <span className="font-bold text-slate-800 font-mono-numbers">{selectedHistory.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">點名時段</span>
                <span className="font-bold text-slate-800 font-mono-numbers">{selectedHistory.startTime} ~ {selectedHistory.endTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">班級</span>
                <span className="font-bold text-slate-800">{selectedHistory.className}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">應到人數</span>
                <span className="font-bold text-slate-800 font-mono-numbers">{selectedHistory.total} 人</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-emerald-600 font-semibold">實到出席</span>
                <span className="font-bold text-emerald-700 font-mono-numbers">{selectedHistory.present} 人</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-amber-600 font-semibold">課堂遲到</span>
                <span className="font-bold text-amber-700 font-mono-numbers">{selectedHistory.late} 人</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-red-600 font-semibold">缺席人數</span>
                <span className="font-bold text-red-700 font-mono-numbers">{selectedHistory.absent} 人</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => {
                  onExportSession(selectedHistory);
                  setSelectedHistory(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <FileDown className="w-4 h-4" />
                <span>匯出試算表 / 報表</span>
              </button>
              <button
                onClick={() => setSelectedHistory(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
