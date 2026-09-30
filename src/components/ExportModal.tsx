import React, { useState } from 'react';
import { AttendanceSession, Student } from '../types';
import { generateAttendanceCsv, generatePlainTextReport, downloadFile, copyToClipboard } from '../utils/exportUtil';
import { FileSpreadsheet, FileText, Copy, Printer, X, Check, Download } from 'lucide-react';

interface ExportModalProps {
  session: AttendanceSession;
  className: string;
  students: Student[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  session,
  className,
  students,
  onClose,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'txt' | 'print'>('csv');
  const [copied, setCopied] = useState<boolean>(false);

  const csvContent = generateAttendanceCsv(session, className, students);
  const textContent = generatePlainTextReport(session, className, students);

  const cleanDate = session.date.replace(/[/\\-]/g, '');
  const cleanClass = className.replace(/\s+/g, '_');
  const cleanCourse = session.courseName.replace(/\s+/g, '_');

  const handleDownload = () => {
    if (selectedFormat === 'csv') {
      const filename = `Classio_${cleanClass}_${cleanCourse}_${cleanDate}.csv`;
      downloadFile(csvContent, filename, 'text/csv');
    } else if (selectedFormat === 'txt') {
      const filename = `Classio_${cleanClass}_${cleanCourse}_${cleanDate}.txt`;
      downloadFile(textContent, filename, 'text/plain');
    } else if (selectedFormat === 'print') {
      window.print();
    }
  };

  const handleCopyText = async () => {
    const content = selectedFormat === 'csv' ? csvContent : textContent;
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">匯出點名出席報表</h3>
              <p className="text-xs text-slate-400">支援 Excel 試算表、純文字摘要與列印</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection Cards */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <button
            onClick={() => setSelectedFormat('csv')}
            className={`p-3 rounded-2xl border flex flex-col items-center transition ${
              selectedFormat === 'csv'
                ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-6 h-6 mb-1 text-emerald-600" />
            <span>Excel (CSV)</span>
            <span className="text-[10px] text-slate-400 font-normal">含 UTF-8 BOM</span>
          </button>

          <button
            onClick={() => setSelectedFormat('txt')}
            className={`p-3 rounded-2xl border flex flex-col items-center transition ${
              selectedFormat === 'txt'
                ? 'border-2 border-blue-600 bg-blue-50 text-blue-800 shadow-xs'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-6 h-6 mb-1 text-blue-600" />
            <span>文字格式 (TXT)</span>
            <span className="text-[10px] text-slate-400 font-normal">適於通訊軟體</span>
          </button>

          <button
            onClick={() => setSelectedFormat('print')}
            className={`p-3 rounded-2xl border flex flex-col items-center transition ${
              selectedFormat === 'print'
                ? 'border-2 border-indigo-600 bg-indigo-50 text-indigo-800 shadow-xs'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-6 h-6 mb-1 text-indigo-600" />
            <span>友善列印 (Print)</span>
            <span className="text-[10px] text-slate-400 font-normal">A4 紙張排版</span>
          </button>
        </div>

        {/* Content Preview Box */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
            <span>預覽內容：</span>
            <span className="text-[10px] text-slate-400 font-mono-numbers">
              {students.length} 筆學生紀錄
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono-numbers max-h-48 overflow-y-auto text-slate-700 whitespace-pre">
            {selectedFormat === 'csv' ? csvContent : textContent}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 pt-1">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>
              {selectedFormat === 'print' ? '啟動系統列印 (A4 報表)' : `下載檔案 (.${selectedFormat.toUpperCase()})`}
            </span>
          </button>

          <button
            onClick={handleCopyText}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">已成功複製到剪貼簿！</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>複製報表文字（可直接貼至 LINE 或 Email）</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
