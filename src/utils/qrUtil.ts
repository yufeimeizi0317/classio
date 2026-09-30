import QRCode from 'qrcode';
import { QRCodePayload } from '../types';

export async function generateQRCodeDataUrl(payload: QRCodePayload): Promise<string> {
  const jsonStr = JSON.stringify(payload);
  try {
    return await QRCode.toDataURL(jsonStr, {
      width: 400,
      margin: 2,
      color: {
        dark: '#182B49',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Error generating QR code data URL', err);
    return '';
  }
}

export function parseQRCodePayload(rawString: string): QRCodePayload | null {
  try {
    const parsed = JSON.parse(rawString);
    if (parsed.sessionId && parsed.token && parsed.classId) {
      return parsed as QRCodePayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function formatSecondsToMMSS(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
