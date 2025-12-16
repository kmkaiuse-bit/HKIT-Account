import { NextResponse } from 'next/server';
import sheetConfig from '@/sheet-config.json';

export async function GET() {
  const envCheck = {
    hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'NOT_SET',
    privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
    privateKeyStartsWith: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 30) || 'NOT_SET',
    sheetId: process.env.GOOGLE_SHEET_ID || sheetConfig.sheetId,
    sheetName: sheetConfig.sheetName,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(envCheck);
}
