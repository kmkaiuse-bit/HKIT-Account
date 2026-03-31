'use client';

import { useState, useEffect, useCallback } from 'react';
import { LogEntry, EVENT_TYPES } from '@/lib/log-types';

type AdminView = 'login' | 'dashboard';

function getEventColor(eventType: string): string {
  if (eventType.includes('FAILURE') || eventType.includes('ERROR')) return 'text-red-700 bg-red-100';
  if (eventType.includes('REJECTED'))  return 'text-orange-700 bg-orange-100';
  if (eventType.includes('APPROVED'))  return 'text-green-700 bg-green-100';
  if (eventType.includes('SUBMITTED')) return 'text-blue-700 bg-blue-100';
  if (eventType.includes('PIN'))       return 'text-purple-700 bg-purple-100';
  if (eventType.includes('AI'))        return 'text-indigo-700 bg-indigo-100';
  if (eventType.includes('ADMIN'))     return 'text-yellow-700 bg-yellow-100';
  if (eventType.includes('AMOUNT'))    return 'text-teal-700 bg-teal-100';
  return 'text-gray-700 bg-gray-100';
}

function getActorColor(actor: string): string {
  switch (actor) {
    case 'staff':      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'accounting': return 'text-green-700 bg-green-50 border-green-200';
    case 'principal':  return 'text-purple-700 bg-purple-50 border-purple-200';
    case 'admin':      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    default:           return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

const PAGE_SIZE = 50;

export default function AdminPage() {
  const [view, setView]               = useState<AdminView>('login');
  const [pin, setPin]                 = useState('');
  const [adminPin, setAdminPin]       = useState('');
  const [authError, setAuthError]     = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  const [logs, setLogs]               = useState<LogEntry[]>([]);
  const [total, setTotal]             = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [filterEventType, setFilterEventType] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate]     = useState('');
  const [page, setPage]               = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = useCallback(async (pinOverride?: string) => {
    const usedPin = pinOverride ?? adminPin;
    if (!usedPin) return;
    setLoadingLogs(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (filterEventType) params.set('eventType', filterEventType);
    if (filterStartDate) params.set('startDate', filterStartDate);
    if (filterEndDate)   params.set('endDate',   filterEndDate);
    try {
      const res = await fetch(`/api/admin/logs?${params}`, {
        headers: { 'x-admin-pin': usedPin },
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setLoadingLogs(false);
    }
  }, [adminPin, page, filterEventType, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (!autoRefresh || view !== 'dashboard') return;
    const interval = setInterval(() => fetchLogs(), 30_000);
    return () => clearInterval(interval);
  }, [autoRefresh, view, fetchLogs]);

  async function handleLogin() {
    if (!pin) return;
    setAuthenticating(true);
    setAuthError(false);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.ok) {
        setAdminPin(pin);
        setPin('');
        setView('dashboard');
        fetchLogs(pin);
      } else {
        setAuthError(true);
        setPin('');
      }
    } catch {
      setAuthError(true);
    } finally {
      setAuthenticating(false);
    }
  }

  function handleApplyFilter() {
    setPage(1);
    fetchLogs();
  }

  function handleResetFilter() {
    setFilterEventType('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(1);
  }

  function handleLogout() {
    setAdminPin('');
    setLogs([]);
    setTotal(0);
    setView('login');
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Login view ──────────────────────────────────────────────────────────────
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">HKIT Payment Request System</p>
          </div>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin PIN"
            autoFocus
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mb-2"
          />
          {authError && (
            <p className="text-xs text-red-500 mb-3">Incorrect PIN. Please try again.</p>
          )}
          <button
            onClick={handleLogin}
            disabled={authenticating || !pin}
            className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors mt-1"
          >
            {authenticating ? 'Verifying…' : 'Access Dashboard'}
          </button>
          <div className="mt-5 text-center">
            <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to main app
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard view ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">HKIT Payment Request System — Activity Logs</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <div
              onClick={() => setAutoRefresh(v => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoRefresh ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            Auto-refresh (30s)
          </label>
          <button
            onClick={() => fetchLogs()}
            disabled={loadingLogs}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loadingLogs ? 'Loading…' : '↻ Refresh'}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {/* Filter bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Event Type</label>
            <select
              value={filterEventType}
              onChange={e => setFilterEventType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
            >
              <option value="">All Events</option>
              {Array.from(EVENT_TYPES).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">From Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">To Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleResetFilter}
            className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Entries', value: total, color: 'text-gray-900' },
            { label: 'Failures', value: logs.filter(l => l.status === 'FAILURE').length + ' / ' + logs.length, color: 'text-red-600' },
            { label: 'Submissions', value: logs.filter(l => l.eventType === 'APPLICATION_SUBMITTED').length, color: 'text-blue-600' },
            { label: 'Approvals', value: logs.filter(l => l.eventType === 'APPLICATION_APPROVED').length, color: 'text-green-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Logs table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingLogs && logs.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading logs…</div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Timestamp</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Event</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Actor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Record No</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Details</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">{log.timestamp}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${getEventColor(log.eventType)}`}>
                          {log.eventType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {log.actor && (
                          <span className={`inline-block text-xs px-2 py-0.5 rounded border ${getActorColor(log.actor)}`}>
                            {log.actor}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 font-mono">{log.recordNo}</td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-xs">
                        <span title={log.details}>
                          {log.details.length > 80 ? log.details.slice(0, 80) + '…' : log.details}
                        </span>
                        {log.extra && (
                          <span
                            title={log.extra}
                            className="ml-1 text-gray-400 cursor-help text-xs"
                          >
                            [+]
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          log.status === 'SUCCESS'
                            ? 'text-green-700 bg-green-100'
                            : 'text-red-700 bg-red-100'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{total} total entries — page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
