import React, { useState } from 'react';
import { Student } from '../types';
import { UserPlus, Edit3, Trash2, KeyRound, Check, X, ShieldAlert } from 'lucide-react';

interface StudentRosterTableProps {
  students: Student[];
  className: string;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onResetPassword: (student: Student) => void;
  onDeleteStudent: (studentId: string, studentName: string) => void;
}

export const StudentRosterTable: React.FC<StudentRosterTableProps> = ({
  students,
  className,
  onAddStudent,
  onEditStudent,
  onResetPassword,
  onDeleteStudent,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 text-lg">班級學生名冊與登入帳號管理</h3>
            <span className="text-xs text-slate-500 font-mono-numbers bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
              共 {students.length} 名學生帳號
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            當前班級：{className}。學生登入帳號即為學號。只有在名冊中已建立且啟用的學生，才能登入學生端完成簽到。
          </p>
        </div>

        <button
          onClick={onAddStudent}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>新增學生登入帳號</span>
        </button>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">座號</th>
              <th className="py-3 px-4">學號 (登入帳號)</th>
              <th className="py-3 px-4">學生姓名</th>
              <th className="py-3 px-4">登入密碼</th>
              <th className="py-3 px-4 text-center">累計出席</th>
              <th className="py-3 px-4 text-center">出席率</th>
              <th className="py-3 px-4 text-center">帳號狀態</th>
              <th className="py-3 px-4 text-right">操作維護</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  尚無學生資料，請點擊上方按鈕新增學生登入帳號
                </td>
              </tr>
            ) : (
              students.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono-numbers font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono-numbers font-bold text-slate-900">
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200/60 font-mono">
                      {s.no}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {s.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    <span 
                      title={`點擊或透過編輯按鈕可修改密碼：${s.password || 'password123'}`}
                      className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-600 select-all cursor-help"
                    >
                      {s.password ? s.password : 'password123'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono-numbers">
                    12 / 12 次
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono-numbers">
                      {s.attendanceRate || '95%'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {s.accountStatus === 'active' ? (
                      <span className="inline-flex items-center text-emerald-700 text-[11px] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
                        可登入
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700 text-[11px] font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        <ShieldAlert className="w-3.5 h-3.5 mr-0.5 text-red-600" />
                        已停權
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => onResetPassword(s)}
                      title="重置為預設密碼 (password123)"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition inline-block cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditStudent(s)}
                      title="編輯學生資料與登入密碼"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition inline-block cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteStudent(s.id, s.name)}
                      title="刪除學生帳號 (刪除後該學生將無法再登入系統)"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition inline-block cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
