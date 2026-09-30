import { Student, AttendanceSession } from '../types';

const UTF8_BOM = '\uFEFF';

function escapeCsv(val: string | number): string {
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateAttendanceCsv(
  session: AttendanceSession,
  className: string,
  students: Student[]
): string {
  const presentCount = students.filter(s => s.status === 'present').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const leaveCount = students.filter(s => s.status === 'leave').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const totalCount = students.length;
  const rate = totalCount > 0 ? (((presentCount + lateCount) / totalCount) * 100).toFixed(1) + '%' : '0%';

  let csv = UTF8_BOM;
  csv += 'Classio 智慧課堂點名出席報表\n';
  csv += `課程名稱,${escapeCsv(session.courseName)},班級名稱,${escapeCsv(className)}\n`;
  csv += `點名日期,${escapeCsv(session.date)},時間範圍,${escapeCsv(`${session.startTime} ~ ${session.endTime || '進行中'}`)}\n`;
  csv += `應到總人數,${totalCount},實到人數,${presentCount},出席率,${rate}\n`;
  csv += `遲到人數,${lateCount},請假人數,${leaveCount},缺席人數,${absentCount}\n`;
  csv += `匯出時間,${new Date().toLocaleString('zh-TW')}\n\n`;

  // Header row
  csv += '座號,學號,姓名,班級,狀態,成績建議,簽到時間,備註\n';

  students.forEach((s, idx) => {
    let score = 100;
    let statusLabel = '出席';
    if (s.status === 'late') { score = 80; statusLabel = '遲到'; }
    else if (s.status === 'leave') { score = 90; statusLabel = '請假'; }
    else if (s.status === 'absent') { score = 0; statusLabel = '缺席'; }
    else if (s.status === 'pending') { score = 0; statusLabel = '未到'; }

    const note = s.status === 'present' ? '動態QR碼掃碼' : (s.status === 'leave' ? '事假證明' : '-');

    csv += `${idx + 1},${escapeCsv(s.no)},${escapeCsv(s.name)},${escapeCsv(className)},${statusLabel},${score},${escapeCsv(s.time)},${escapeCsv(note)}\n`;
  });

  const startRow = 9;
  const endRow = 8 + totalCount;
  csv += `\n平均出席分數,,,,=AVERAGE(F${startRow}:F${endRow})\n`;

  return csv;
}

export function generatePlainTextReport(
  session: AttendanceSession,
  className: string,
  students: Student[]
): string {
  const presentCount = students.filter(s => s.status === 'present').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const leaveCount = students.filter(s => s.status === 'leave').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const totalCount = students.length;
  const rate = totalCount > 0 ? (((presentCount + lateCount) / totalCount) * 100).toFixed(1) + '%' : '0%';

  let txt = '===================================================\n';
  txt += '          Classio 課堂點名出席統計報告             \n';
  txt += '===================================================\n\n';
  txt += `【課程名稱】：${session.courseName}\n`;
  txt += `【班級代號】：${className}\n`;
  txt += `【點名日期】：${session.date} (${session.startTime} ~ ${session.endTime || '現在'})\n`;
  txt += `【匯出時間】：${new Date().toLocaleString('zh-TW')}\n\n`;
  txt += '---------------- 出席統計數據 --------------------\n';
  txt += `  應到人數：${totalCount} 人\n`;
  txt += `  實到出席：${presentCount} 人 (實質出席率：${rate})\n`;
  txt += `  課堂遲到：${lateCount} 人\n`;
  txt += `  核准請假：${leaveCount} 人\n`;
  txt += `  未到缺席：${absentCount} 人\n`;
  txt += '---------------------------------------------------\n\n';
  txt += '座號   學號        姓名      狀態    簽到時間   備註\n';
  txt += '---------------------------------------------------\n';

  students.forEach((s, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const no = s.no.padEnd(10, ' ');
    const name = s.name.padEnd(6, ' ');
    let stText = '出席';
    if (s.status === 'late') stText = '遲到';
    if (s.status === 'leave') stText = '請假';
    if (s.status === 'absent') stText = '缺席';
    if (s.status === 'pending') stText = '未到';

    const time = (s.time || '--:--').padEnd(8, ' ');
    const note = s.status === 'present' ? 'QR簽到' : (s.status === 'leave' ? '事假' : '-');
    txt += `${num}    ${no}  ${name}  ${stText}    ${time}   ${note}\n`;
  });

  txt += '---------------------------------------------------\n';
  txt += '本報表由 Classio 智慧課堂點名系統即時生成\n';
  return txt;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy', err);
    return false;
  }
}

export function createDunningMailtoUrl(
  bccEmails: string[],
  courseName: string,
  assignmentTitle: string,
  dueDate: string,
  customNote?: string
): string {
  const subject = encodeURIComponent(`【作業催繳通知】${courseName} - ${assignmentTitle}`);
  const bodyText = `各位同學好：

這是來自 ${courseName} 課程的作業催繳通知。

【作業名稱】：${assignmentTitle}
【繳交截止時間】：${dueDate}
${customNote ? `【備註說明】：${customNote}\n` : ''}
系統紀錄您目前尚未完成繳交，請同學務必於截止前儘速上傳或補繳，以免影響學期成績。
若有任何疑問或已繳交請向任課教師反映確認。

Classio 智慧課堂作業系統
${new Date().toLocaleDateString('zh-TW')}`;

  const body = encodeURIComponent(bodyText);
  return `mailto:?bcc=${bccEmails.join(',')}&subject=${subject}&body=${body}`;
}
