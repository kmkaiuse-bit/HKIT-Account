// Shared log types — imported by both client and server code.
// Keep this file free of server-only imports (no googleapis, no fs, etc.)

export const EVENT_TYPES = [
  'APPLICATION_SUBMITTED',
  'APPLICATION_APPROVED',
  'APPLICATION_REJECTED',
  'AMOUNT_UPDATED',
  'PIN_VERIFIED',
  'PIN_FAILED',
  'AI_SCAN_SUCCESS',
  'AI_SCAN_FAILURE',
  'API_ERROR',
  'ADMIN_LOGIN_SUCCESS',
  'ADMIN_LOGIN_FAILURE',
] as const;

export type EventType = typeof EVENT_TYPES[number];

export interface LogEntry {
  timestamp: string;
  eventType: string;
  actor: string;
  recordNo: string;
  details: string;
  status: 'SUCCESS' | 'FAILURE';
  ipAddress: string;
  extra: string;
}
