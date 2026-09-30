import React, { useState } from 'react';
import { Assignment, AssignmentSubmission, Student } from '../types';
import { createDunningMailtoUrl, copyToClipboard } from '../utils/exportUtil';
import { 
  Plus, 
  Calendar, 
  BellRing, 
  Mail, 
  CheckCircle, 
  Clock, 
  Copy, 
  X, 
  FileText,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface AssignmentManagerProps {
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  students: Student[];
  className: string;
  onAddAssignment: () => void;
  onToggleSubmission: (submissionId: string) => void;
  onSendDunningReminder: (assignmentId: string, reminderNote: string) => void;
  onDeleteAssignment: (assignmentId: string) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  assignments,
  submissions,
  students,
  className,
  onAddAssignment,
  onToggleSubmission,
  onSendDunningReminder,
  onDeleteAssignment,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDunningModal, setShowDunningModal] = useState<boolean>(false);
  const [dunningNote, setDunningNote] = useState<string>('請同學務必於截止日前儘快繳交，逾期將依課程規範扣分！');
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Filter submissions for selected assignment
  const currentSubmissions = selectedAssignment
    ? submissions.filter((sub) => sub.assignmentId === selectedAssignment.id)
    : [];

  const unsubmittedSubmissions = currentSubmissions.filter((sub) => !sub.isSubmitted);

  const handleOpenInventory = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleSendReminderConfirm = () => {
    if (!selectedAssignment) return;
    onSendDunningReminder(selectedAssignment.id, dunningNote);
    setShowDunningModal(false);
    alert(`已向 ${unsubmittedSubmissions.length} 位未繳交同學發送系統催繳通知！`);
  };

  const handleCopyEmailList = async () => {
    const unsubmittedStudentIds = unsubmittedSubmissions.map((sub) => sub.studentId);
    const emails = students
      .filter((st) => unsubmittedStudentIds.includes(st.id))
      .map((st) => st.email);
    
    await copyToClipboard(emails.join(', '));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 text-lg">作業繳交統計與催繳系統</h3>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              催繳通知模組
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            當前班級：{className}。支援即時掌握未繳名單、學生端系統警示、一鍵產生 BCC 密件副本 Email 與 LINE 群組催繳文案。
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onAddAssignment}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>建立新作業</span>
          </button>
        </div>
      </div>

      {/* Assignment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assignments.map((assignment) => {
          const assignSubs = submissions.filter((sub) => sub.assignmentId === assignment.id);
          const totalSubs = assignSubs.length || students.length;
          const submittedCount = assignSubs.filter((sub) => sub.isSubmitted).length;
          const unsubmittedCount = totalSubs - submittedCount;

          return (
            <div
              key={assignment.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {assignment.title}
                  </h4>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      unsubmittedCount > 0
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {unsubmittedCount > 0 ? `未繳 ${unsubmittedCount} 人` : '全數繳交'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mt-2 flex items-center space-x-1 font-mono-numbers">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>截止時間：{assignment.due}</span>
                </div>

                {assignment.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                {/* Unsubmitted Highlight Box */}
                {unsubmittedCount > 0 ? (
                  <div className="mt-3 text-xs bg-red-50/90 border border-red-200/70 rounded-xl p-3">
                    <span className="font-bold text-red-700 block mb-1">
                      未繳交學生 ({unsubmittedCount}人)：
                    </span>
                    <span className="text-red-600">
                      {assignSubs
                        .filter((sub) => !sub.isSubmitted)
                        .map((s) => `${s.studentName} (${s.studentNo})`)
                        .join('、 ')}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 p-2.5 rounded-xl flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>本作業所有學生皆已完成繳交！</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono-numbers font-semibold">
                  已繳交 {submittedCount} / {totalSubs}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenInventory(assignment)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition flex items-center space-x-1 border border-blue-200"
                  >
                    <span>盤點名冊</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`確定刪除「${assignment.title}」作業嗎？`)) {
                        onDeleteAssignment(assignment.id);
                      }
                    }}
                    className="text-slate-400 hover:text-red-600 p-1 text-xs"
                    title="刪除作業"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inventory & Individual Student Status Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedAssignment.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono-numbers mt-0.5">
                  課程：{selectedAssignment.courseName} · 截止期限：{selectedAssignment.due}
                </p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-around text-center text-xs font-mono-numbers">
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">應繳總人數</span>
                <span className="text-base font-black text-slate-800">{currentSubmissions.length} 人</span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-600 block font-semibold">已完成繳交</span>
                <span className="text-base font-black text-emerald-700">
                  {currentSubmissions.filter(s => s.isSubmitted).length} 人
                </span>
              </div>
              <div>
                <span className="text-[11px] text-red-600 block font-semibold">未繳交催繳中</span>
                <span className="text-base font-black text-red-700">
                  {unsubmittedSubmissions.length} 人
                </span>
              </div>
            </div>

            {/* Dunning Triggers */}
            {unsubmittedSubmissions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setShowDunningModal(true)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <BellRing className="w-4 h-4" />
                  <span>發送系統催繳推播通知 ({unsubmittedSubmissions.length}人)</span>
                </button>

                <button
                  onClick={() => setShowEmailPreviewModal(true)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>產生 BCC 催繳 Email</span>
                </button>
              </div>
            )}

            {/* Student Submission List */}
            <div className="space-y-2 mt-2">
              <span className="text-xs font-bold text-slate-700 block">學生繳交名冊詳細清單：</span>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                {currentSubmissions.map((sub) => {
                  const student = students.find((s) => s.id === sub.studentId);
                  return (
                    <div
                      key={sub.id}
                      className="py-2.5 px-3 flex items-center justify-between hover:bg-white rounded-xl transition"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-800">{sub.studentName}</span>
                          <span className="text-[11px] text-slate-500 font-mono-numbers">{sub.studentNo}</span>
                          {sub.remindedCount > 0 && !sub.isSubmitted && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold font-mono-numbers">
                              已催繳 {sub.remindedCount} 次
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono-numbers">
                          {student?.email}
                          {sub.submittedAt && ` · 繳交時間: ${new Date(sub.submittedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`}
                        </div>
                      </div>

                      {/* Toggle status button */}
                      <button
                        onClick={() => onToggleSubmission(sub.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                          sub.isSubmitted
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {sub.isSubmitted ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>已繳交</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            <span>未繳交 (點擊改已繳)</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Close */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
              >
                關閉名冊
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dunning Note Modal */}
      {showDunningModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BellRing className="w-5 h-5 text-red-600" />
              <span>發送作業催繳通知</span>
            </h3>
            <p className="text-xs text-slate-500">
              將向 {unsubmittedSubmissions.length} 位尚未繳交「{selectedAssignment.title}」的同學發送系統催繳提醒，學生端首頁將亮起紅框警示。
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                催繳備註訊息：
              </label>
              <textarea
                value={dunningNote}
                onChange={(e) => setDunningNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleSendReminderConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
              >
                立即發送提醒
              </button>
              <button
                onClick={() => setShowDunningModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BCC Email Preview Modal */}
      {showEmailPreviewModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>BCC 密件副本催繳信產生器</span>
              </h3>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              自動將所有未繳交學生的學校信箱放入 BCC 密件副本，保護同學隱私並一鍵寄出。
            </p>

            {/* Email Recipients */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">收件人 (BCC 密件副本)：</span>
                <button
                  onClick={handleCopyEmailList}
                  className="text-blue-600 hover:underline flex items-center space-x-1 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedToast ? '已複製！' : '複製所有信箱'}</span>
                </button>
              </div>
              <div className="text-[11px] font-mono-numbers text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 max-h-20 overflow-y-auto break-all">
                {students
                  .filter((s) => unsubmittedSubmissions.some((sub) => sub.studentId === s.id))
                  .map((s) => s.email)
                  .join(', ')}
              </div>
            </div>

            {/* Email Subject & Body Preview */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-700">信件主旨：</span>
                <div className="mt-0.5 font-bold text-slate-800">
                  【作業催繳通知】{selectedAssignment.courseName} - {selectedAssignment.title}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-700">信件內容：</span>
                <div className="mt-0.5 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 whitespace-pre-wrap text-[11px] leading-relaxed">
                  {`各位同學好：\n\n這是來自 ${selectedAssignment.courseName} 課程的作業催繳通知。\n\n【作業名稱】：${selectedAssignment.title}\n【繳交截止時間】：${selectedAssignment.due}\n\n系統紀錄您目前尚未完成繳交，請同學務必於截止前儘速上傳或補繳，以免影響學期成績。\n\nClassio 智慧課堂作業系統`}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <a
                href={createDunningMailtoUrl(
                  students
                    .filter((s) => unsubmittedSubmissions.some((sub) => sub.studentId === s.id))
                    .map((s) => s.email),
                  selectedAssignment.courseName,
                  selectedAssignment.title,
                  selectedAssignment.due
                )}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center space-x-2 text-center"
              >
                <Mail className="w-4 h-4" />
                <span>開啟郵件軟體發送 (Mailto)</span>
              </a>

              <button
                onClick={async () => {
                  const text = `【作業催繳通知】${selectedAssignment.courseName} - ${selectedAssignment.title}\n截止時間：${selectedAssignment.due}\n未繳名單：${unsubmittedSubmissions.map(s => s.studentName).join('、')}\n請同學儘速完成繳交！`;
                  await copyToClipboard(text);
                  alert('催繳訊息已複製，可直接貼至 LINE 群組！');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>複製 LINE 群組催繳廣播文案</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
