import React, { useState } from 'react';
import { Student, AttendanceStatus } from '../types';
import { Search, CheckCircle2, Clock, AlertCircle, CalendarX2 } from 'lucide-react';

interface LiveRosterProps {
  students: Student[];
  onCycleStatus: (studentId: string) => void;
}

export const LiveRoster: React.FC<LiveRosterProps> = ({ students, onCycleStatus }) => {
  const [filter, setFilter] = useState<'all' | AttendanceStatus>('all');
  const [search, setSearch] = useState('');

  const filteredStudents = students.filter((s) => {
    const matchesFilter = filter === 'all' || s.status === filter;
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.no.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>出席</span>
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>遲到</span>
          </span>
        );
      case 'leave':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CalendarX2 className="w-3 h-3 text-blue-600" />
            <span>請假</span>
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span>缺席</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span>未到</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">即時點名名冊</h3>
          <p className="text-xs text-slate-500 mt-0.5">點擊學生狀態標籤即可一鍵切換 出席 / 遲到 / 請假 / 缺席</p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋學號或姓名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition"
          />
        </div>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-3 text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          全部 ({students.length})
        </button>
        <button
          onClick={() => setFilter('present')}
          className={`px-3 py-1 rounded-lg transition ${
            filter === 'present'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          出席 ({students.filter(s => s.status === 'present').length})
        </button>
        <button
          onClick={() => setFilter('late')}
          className={`px-3 py-1 rounded-lg transition ${
            filter === 'late'
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          遲到 ({students.filter(s => s.status === 'late').length})
        </button>
        <button
          onClick={() => setFilter('absent')}
          className={`px-3 py-1 rounded-lg transition ${
            filter === 'absent'
              ? 'bg-red-600 text-white shadow-xs font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          缺席 ({students.filter(s => s.status === 'absent').length})
        </button>
        <button
          onClick={() => setFilter('leave')}
          className={`px-3 py-1 rounded-lg transition ${
            filter === 'leave'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          請假 ({students.filter(s => s.status === 'leave').length})
        </button>
      </div>

      {/* Student List Container */}
      <div className="flex-1 overflow-y-auto max-h-[480px] space-y-2 pr-1">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            沒有符合篩選條件的學生
          </div>
        ) : (
          filteredStudents.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => onCycleStatus(s.id)}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 transition cursor-pointer select-none active:scale-[0.99] group"
              title="點擊可輪替切換簽到狀態"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono-numbers font-bold text-slate-400 w-5">
                  {idx + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                  {s.name.substring(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {s.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono-numbers">
                    {s.no} · {s.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400 font-mono-numbers hidden sm:inline">
                  {s.time}
                </span>
                {getStatusBadge(s.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
