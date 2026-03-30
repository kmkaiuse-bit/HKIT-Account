'use client';

import { useEffect, useRef, useState } from 'react';
import { LABELS, CENTRE_OPTIONS, PROGRAMME_OPTIONS, EDB_OPTIONS, type Lang, type Labels } from '@/lib/constants';

interface Application {
  rowIndex: number;
  record_no: string;
  timestamp: string;
  date: string;
  staff_name: string;
  payment_details: string;
  claimants: string;
  payment_total_amount: number | undefined;
  supplier_name: string;
  bank_name: string;
  bank_account_number: string;
  remark: string;
  centre: string;
  programme: string;
  term: string;
  edb_funding: string;
  estimated_payment_date: string;
  approval_status: string;
  quotation_link: string;
}

interface ClaimantRow { name: string; amount: string; description: string; }

type Role = 'staff' | 'accounting' | 'principal';

function toEmbedUrl(url: string): string {
  return url.replace(/\/(view|edit)(\?.*)?$/, '/preview');
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
}

const emptyForm = {
  staff_name: '',
  date: '',
  centre: '',
  programme: '',
  term: '',
  supplier_name: '',
  bank_name: '',
  bank_account_number: '',
  edb_funding: '',
  estimated_payment_date: '',
  remark: '',
};

const emptyClaimant: ClaimantRow = { name: '', amount: '', description: '' };

// ── Multi-Select component ────────────────────────────────────────────────────
function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? value.split(',').filter(Boolean) : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt];
    onChange(next.join(','));
  }

  function remove(opt: string) {
    onChange(selected.filter(s => s !== opt).join(','));
  }

  return (
    <div ref={ref} className="relative">
      {/* Chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {selected.map(s => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
            >
              {s}
              <button
                type="button"
                onClick={() => remove(s)}
                className="hover:text-blue-900 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-left text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {selected.length === 0 ? (placeholder || 'Select...') : `${selected.length} selected`}
        <span className="float-right text-gray-400">▾</span>
      </button>
      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {options.map(opt => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-blue-600"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PIN Modal ────────────────────────────────────────────────────────────────
function PinModal({
  role,
  L,
  onSuccess,
  onCancel,
}: {
  role: Role;
  L: Labels;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function submit() {
    setChecking(true);
    setError(false);
    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, pin }),
      });
      const data = await res.json();
      if (data.ok) {
        onSuccess();
      } else {
        setError(true);
        setPin('');
      }
    } catch {
      setError(true);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{L.pinTitle}</h3>
        <input
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder={L.pinPlaceholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          autoFocus
        />
        {error && <p className="text-xs text-red-500 mb-2">{L.pinError}</p>}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
          >
            {L.cancel}
          </button>
          <button
            onClick={submit}
            disabled={checking || !pin}
            className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {checking ? '...' : L.pinSubmit}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>('staff');
  const [lang, setLang] = useState<Lang>('zh');

  // Staff form
  const [form, setForm] = useState(emptyForm);
  const [claimants, setClaimants] = useState<ClaimantRow[]>([{ ...emptyClaimant }]);
  const [quotationFiles, setQuotationFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI scan
  const [scanningIdx, setScanningIdx] = useState<number | null>(null);
  const [aiNotice, setAiNotice] = useState(false);

  // Principal
  const [showAllPrincipal, setShowAllPrincipal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Amount edit
  const [editingAmountRow, setEditingAmountRow] = useState<number | null>(null);
  const [editingAmountValue, setEditingAmountValue] = useState('');

  // PIN access
  const [unlockedRoles, setUnlockedRoles] = useState<Set<Role>>(new Set<Role>(['staff']));
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const L = LABELS[lang];

  // Load lang from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hkit_lang') as Lang | null;
    if (saved === 'en' || saved === 'zh') setLang(saved);
  }, []);

  // Load unlocked roles from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('hkit_unlocked');
      if (saved) {
        const arr = JSON.parse(saved) as Role[];
        setUnlockedRoles(new Set(arr));
      }
    } catch {}
  }, []);

  useEffect(() => { fetchApplications(); }, []);

  function toggleLang() {
    const next: Lang = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    localStorage.setItem('hkit_lang', next);
  }

  async function fetchApplications() {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.success) setApplications(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleTabClick(key: Role) {
    if (unlockedRoles.has(key)) {
      setRole(key);
      if (key === 'accounting' || key === 'principal') fetchApplications();
    } else {
      setPendingRole(key);
    }
  }

  function onPinSuccess() {
    if (!pendingRole) return;
    const next = new Set<Role>(Array.from(unlockedRoles));
    next.add(pendingRole);
    setUnlockedRoles(next);
    try { sessionStorage.setItem('hkit_unlocked', JSON.stringify(Array.from(next))); } catch {}
    setRole(pendingRole);
    setPendingRole(null);
  }

  // ── AI scan ────────────────────────────────────────────────────────────────
  async function handleFilesChange(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return;
    const toAdd = Array.from(incoming).slice(0, 5 - quotationFiles.length);
    if (toAdd.length === 0) return;

    const baseIdx = quotationFiles.length;
    setQuotationFiles(prev => [...prev, ...toAdd]);
    setAiNotice(false);

    for (let i = 0; i < toAdd.length; i++) {
      const file = toAdd[i];
      const fileIdx = baseIdx + i;
      setScanningIdx(fileIdx);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/scan-quotation', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          if (fileIdx === 0 && data.supplier_name) {
            setForm(f => ({ ...f, supplier_name: data.supplier_name }));
          }
          if (data.description || data.amount) {
            setClaimants(prev => {
              const next = [...prev];
              const emptyIdx = next.findIndex(r => !r.description && !r.amount);
              const target = emptyIdx >= 0 ? emptyIdx : next.length;
              if (target >= next.length) next.push({ ...emptyClaimant });
              next[target] = {
                ...next[target],
                ...(data.description && { description: data.description }),
                ...(data.amount      && { amount: String(data.amount) }),
              };
              return next;
            });
          }
          setAiNotice(true);
        }
      } catch (e) {
        console.error('AI scan error:', e);
      }
      setScanningIdx(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Submit form ───────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const total = claimants.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
      const paymentDetails = claimants
        .filter(c => c.name || c.description)
        .map(c => [c.name, c.description].filter(Boolean).join(': '))
        .join('\n');

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('payment_total_amount', String(total));
      fd.append('payment_details', paymentDetails);
      fd.append('claimants', JSON.stringify(claimants));
      quotationFiles.forEach((f, i) => fd.append(`quotation_${i}`, f));

      const res = await fetch('/api/submit', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.success) {
        const msg = data.warning
          ? `${L.successWarn}${data.warning}`
          : L.successMsg;
        setSubmitResult({ ok: true, msg });
        setForm(emptyForm);
        setClaimants([{ ...emptyClaimant }]);
        setQuotationFiles([]);
        setAiNotice(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchApplications();
      } else {
        setSubmitResult({ ok: false, msg: L.errorSubmit + data.error });
      }
    } catch {
      setSubmitResult({ ok: false, msg: L.errorNetwork });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Approve ───────────────────────────────────────────────────────────────
  async function handleApprove(app: Application) {
    if (!confirm(`${L.confirmApprove} — ${app.staff_name}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: app.rowIndex, status: 'APPROVED' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(L.approveAlert);
        fetchApplications();
      } else {
        alert(L.errorOp + data.error);
      }
    } catch {
      alert(L.errorOpGeneric);
    } finally {
      setActionLoading(false);
    }
  }

  // ── Reject ────────────────────────────────────────────────────────────────
  async function handleReject() {
    if (!selectedApp) return;
    if (rejectionReason.length < 20) {
      alert(L.rejectMinAlert);
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: selectedApp.rowIndex, status: 'REJECTED', rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedApp(null);
        fetchApplications();
      } else {
        alert(L.errorOp + data.error);
      }
    } catch {
      alert(L.errorOpGeneric);
    } finally {
      setActionLoading(false);
    }
  }

  // ── Amount edit ───────────────────────────────────────────────────────────
  async function saveAmount(app: Application) {
    const newAmount = parseFloat(editingAmountValue);
    if (isNaN(newAmount) || newAmount < 0) return;
    try {
      const res = await fetch('/api/update-amount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: app.rowIndex, newAmount }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingAmountRow(null);
        fetchApplications();
      } else {
        alert(L.errorOp + data.error);
      }
    } catch {
      alert(L.errorOpGeneric);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getStatusColor(status: string) {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED': return 'text-green-700 bg-green-100';
      case 'REJECTED': return 'text-red-700 bg-red-100';
      case 'PENDING':  return 'text-yellow-700 bg-yellow-100';
      default:         return 'text-gray-600 bg-gray-100';
    }
  }

  function getStatusText(status: string) {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED': return L.statusApproved;
      case 'REJECTED': return L.statusRejected;
      case 'PENDING':  return L.statusPending;
      default:         return status || '—';
    }
  }

  const totalAmount   = applications.reduce((s, a) => s + (a.payment_total_amount ?? 0), 0);
  const pendingCount  = applications.filter(a => (a.approval_status || '').toUpperCase() === 'PENDING').length;
  const approvedCount = applications.filter(a => (a.approval_status || '').toUpperCase() === 'APPROVED').length;
  const rejectedCount = applications.filter(a => (a.approval_status || '').toUpperCase() === 'REJECTED').length;

  const principalList = showAllPrincipal
    ? applications
    : applications.filter(a => (a.approval_status || '').toUpperCase() === 'PENDING');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">{L.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{L.systemTitle}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{L.systemSubtitle}</p>
            </div>
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-600"
            >
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-gray-200 -mb-px">
            {([
              ['staff',      L.tabStaff],
              ['accounting', L.tabAccounting],
              ['principal',  L.tabPrincipal],
            ] as [Role, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleTabClick(key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  role === key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
                {key === 'principal' && pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    {pendingCount}
                  </span>
                )}
                {!unlockedRoles.has(key) && (
                  <span className="ml-1 text-gray-400 text-xs">🔒</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {pendingRole && (
        <PinModal
          role={pendingRole}
          L={L}
          onSuccess={onPinSuccess}
          onCancel={() => setPendingRole(null)}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          STAFF TAB
      ══════════════════════════════════════════════════════ */}
      {role === 'staff' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow p-6 sm:p-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-gray-900">{L.formTitle}</h2>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    staff_name: 'Test User',
                    date: new Date().toISOString().split('T')[0],
                    centre: 'SSP',
                    programme: 'DAE FT',
                    term: '2024-25 Term A',
                    supplier_name: 'ABC Trading Co.',
                    bank_name: 'HSBC',
                    bank_account_number: '123-456789-001',
                    edb_funding: 'ECA',
                    estimated_payment_date: '',
                    remark: 'Test submission',
                  });
                  setClaimants([
                    { name: 'Test User', amount: '800', description: 'Office supplies' },
                    { name: 'Jane Doe',  amount: '434', description: 'Books' },
                  ]);
                }}
                className="text-xs px-2 py-1 border border-dashed border-gray-300 text-gray-400 rounded hover:border-blue-400 hover:text-blue-500"
              >
                Fill test data
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">{L.formSubtitle}</p>

            {submitResult && (
              <div className={`mb-6 p-4 rounded-lg text-sm ${submitResult.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {submitResult.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L.staffName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" required
                    value={form.staff_name}
                    onChange={e => setForm(f => ({ ...f, staff_name: e.target.value }))}
                    placeholder={L.phFullName}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L.date} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date" required
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Centre + Programme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L.centre} <span className="text-red-500">*</span>
                  </label>
                  <MultiSelect
                    options={CENTRE_OPTIONS}
                    value={form.centre}
                    onChange={v => setForm(f => ({ ...f, centre: v }))}
                    placeholder={L.phCentre}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L.programme} <span className="text-red-500">*</span>
                  </label>
                  <MultiSelect
                    options={PROGRAMME_OPTIONS}
                    value={form.programme}
                    onChange={v => setForm(f => ({ ...f, programme: v }))}
                    placeholder={L.phProgramme}
                  />
                </div>
              </div>

              {/* Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L.term} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required
                  value={form.term}
                  onChange={e => setForm(f => ({ ...f, term: e.target.value }))}
                  placeholder={L.phTerm}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Claimants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {L.claimants} <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500 font-medium">
                    {L.claimantsTotal}: HKD {claimants.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500" style={{gridTemplateColumns:'1fr 1.5fr 90px 24px'}}>
                    <span>{L.claimantName}</span>
                    <span>{L.claimantDesc}</span>
                    <span className="text-right">{L.claimantAmount}</span>
                    <span/>
                  </div>
                  {claimants.map((row, idx) => (
                    <div key={idx} className="grid gap-2 px-3 py-2 border-t border-gray-100 items-center" style={{gridTemplateColumns:'1fr 1.5fr 90px 24px'}}>
                      <input
                        type="text"
                        value={row.name}
                        onChange={e => setClaimants(prev => { const n=[...prev]; n[idx]={...n[idx],name:e.target.value}; return n; })}
                        placeholder={L.phFullName}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={row.description}
                        onChange={e => setClaimants(prev => { const n=[...prev]; n[idx]={...n[idx],description:e.target.value}; return n; })}
                        placeholder={L.claimantDesc}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={row.amount}
                        onChange={e => setClaimants(prev => { const n=[...prev]; n[idx]={...n[idx],amount:e.target.value}; return n; })}
                        placeholder="0.00"
                        min="0" step="0.01"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setClaimants(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx))}
                        disabled={claimants.length === 1}
                        className="text-gray-300 hover:text-red-400 disabled:opacity-0 text-base leading-none"
                      >×</button>
                    </div>
                  ))}
                </div>
                {claimants.length < 10 && (
                  <button
                    type="button"
                    onClick={() => setClaimants(prev => [...prev, { ...emptyClaimant }])}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >{L.addClaimant}</button>
                )}
              </div>

              {/* Supplier Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L.supplierName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required
                  value={form.supplier_name}
                  onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))}
                  placeholder={L.phSupplierName}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bank Name + Bank Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{L.bankName}</label>
                  <input
                    type="text"
                    value={form.bank_name}
                    onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
                    placeholder={L.phBankName}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{L.bankAccount}</label>
                  <input
                    type="text"
                    value={form.bank_account_number}
                    onChange={e => setForm(f => ({ ...f, bank_account_number: e.target.value }))}
                    placeholder={L.phBankAccount}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* EDB + Expected Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{L.edbFunding}</label>
                  <MultiSelect
                    options={EDB_OPTIONS}
                    value={form.edb_funding}
                    onChange={v => setForm(f => ({ ...f, edb_funding: v }))}
                    placeholder={L.phEdb}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{L.expectedPayDate}</label>
                  <input
                    type="date"
                    value={form.estimated_payment_date}
                    onChange={e => setForm(f => ({ ...f, estimated_payment_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{L.remark}</label>
                <textarea
                  rows={2}
                  value={form.remark}
                  onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                  placeholder={L.phRemark}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Quotation Upload (multi-file, max 5) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L.quotation}
                  <span className="ml-2 text-xs text-gray-400 font-normal">{L.quotationHint}</span>
                  <span className="ml-1 text-xs text-gray-400 font-normal">(max 5)</span>
                </label>
                {quotationFiles.length < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      multiple
                      onChange={e => handleFilesChange(e.target.files)}
                      className="hidden"
                      id="quotation-upload"
                    />
                    <label htmlFor="quotation-upload" className="cursor-pointer">
                      {scanningIdx !== null ? (
                        <div className="text-sm text-blue-600">{L.aiScanning} ({scanningIdx + 1})</div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          <span className="text-blue-600 font-medium">{L.clickUpload}</span>
                          <span className="ml-1">{L.orDrop}</span>
                        </div>
                      )}
                    </label>
                  </div>
                )}
                {quotationFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {quotationFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5 text-sm">
                        <span className="text-blue-600 font-medium truncate">{f.name}</span>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-gray-400 text-xs">{(f.size / 1024).toFixed(0)} KB</span>
                          {scanningIdx === i && <span className="text-xs text-blue-500">{L.aiScanning}</span>}
                          <button
                            type="button"
                            onClick={() => setQuotationFiles(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >{L.removeFile}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {aiNotice && <p className="mt-1 text-xs text-blue-600">{L.aiFilled}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting || scanningIdx !== null}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? L.submitting : L.submitBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ACCOUNTING TAB
      ══════════════════════════════════════════════════════ */}
      {role === 'accounting' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: L.totalApps,   value: applications.length,                  color: 'text-gray-900' },
              { label: L.totalAmount, value: `$${totalAmount.toLocaleString()}`,    color: 'text-blue-600' },
              { label: L.pending,     value: pendingCount,                          color: 'text-yellow-600' },
              { label: L.approved,    value: approvedCount,                         color: 'text-green-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Actions bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {applications.length} {L.recordsInfo}（{rejectedCount} {L.rejected}）
            </p>
            <div className="flex gap-3">
              <button
                onClick={fetchApplications}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {L.refresh}
              </button>
              <a
                href="/api/export"
                download="payment-requests.xlsx"
                className="px-4 py-2 text-sm bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                {L.downloadExcel}
              </a>
            </div>
          </div>

          {/* Data table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      L.colRecordNo, L.colSubmitTime, L.colDate, L.colStaff,
                      L.colPaymentDetails, L.colAmount, L.colSupplier, L.colBank,
                      L.colBankAccount, L.colCentre, L.colProgramme, L.colTerm,
                      L.colEdb, L.colExpectedDate, L.colStatus, L.colQuotation,
                    ].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="px-4 py-8 text-center text-gray-400">{L.noRecords}</td>
                    </tr>
                  ) : applications.map(app => (
                    <tr key={app.rowIndex} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-600">{app.record_no}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{app.timestamp}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{app.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{app.staff_name}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="block truncate" title={app.payment_details}>{app.payment_details}</span>
                      </td>
                      {/* Amount with inline edit */}
                      <td className="px-4 py-3 whitespace-nowrap text-right font-medium group">
                        {editingAmountRow === app.rowIndex ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editingAmountValue}
                              onChange={e => setEditingAmountValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveAmount(app);
                                if (e.key === 'Escape') setEditingAmountRow(null);
                              }}
                              className="w-24 border border-blue-400 rounded px-2 py-0.5 text-sm focus:outline-none"
                              autoFocus
                            />
                            <button onClick={() => saveAmount(app)} className="text-green-600 hover:text-green-700 text-xs">✓</button>
                            <button onClick={() => setEditingAmountRow(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                          </div>
                        ) : (
                          <span className="flex items-center justify-end gap-1">
                            ${(app.payment_total_amount ?? 0).toLocaleString()}
                            <button
                              onClick={() => {
                                setEditingAmountRow(app.rowIndex);
                                setEditingAmountValue(String(app.payment_total_amount ?? 0));
                              }}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity text-xs ml-1"
                              title="Edit amount"
                            >
                              ✎
                            </button>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{app.supplier_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{app.bank_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{app.bank_account_number}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{app.centre}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{app.programme}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{app.term}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{app.edb_funding}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{app.estimated_payment_date}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.approval_status)}`}>
                          {getStatusText(app.approval_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {app.quotation_link ? (
                          <div className="flex gap-2">
                            {app.quotation_link.split(', ').filter(Boolean).map((link, i) => (
                              <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs">
                                {app.quotation_link.split(', ').length > 1 ? `${L.view} ${i+1}` : L.view}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PRINCIPAL TAB
      ══════════════════════════════════════════════════════ */}
      {role === 'principal' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

          <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              {showAllPrincipal
                ? `${L.showingAll} ${applications.length} ${L.apps}`
                : `${pendingCount} ${L.pendingCount}`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAllPrincipal(v => !v)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {showAllPrincipal ? L.showPending : L.viewAll}
              </button>
              <button
                onClick={fetchApplications}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                {L.refresh}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {principalList.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
                {showAllPrincipal ? L.noApplications : L.noPending}
              </div>
            ) : principalList.map(app => (
              <div key={app.rowIndex} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {app.record_no && (
                          <span className="text-xs font-mono text-gray-400">{app.record_no}</span>
                        )}
                        <h3 className="font-semibold text-gray-900 truncate" title={app.payment_details}>
                          {app.payment_details}
                        </h3>
                      </div>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span>👤 {app.staff_name}</span>
                        <span>🏫 {app.centre}</span>
                        <span>📚 {app.programme}</span>
                        <span>📅 {app.date}</span>
                        <span>📆 {app.term}</span>
                        {app.edb_funding && <span>💰 {app.edb_funding}</span>}
                        {app.supplier_name && <span>🏢 {app.supplier_name}</span>}
                      </div>
                      {app.remark && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                          <span className="font-medium text-gray-700">{L.noteLabel}</span>{app.remark}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-2xl font-bold ${(app.payment_total_amount ?? 0) > 1000 ? 'text-red-600' : 'text-gray-900'}`}>
                        ${(app.payment_total_amount ?? 0).toLocaleString()}
                      </p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.approval_status)}`}>
                        {getStatusText(app.approval_status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(app.approval_status || '').toUpperCase() === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(app)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          ✓ {L.approve}
                        </button>
                        <button
                          onClick={() => { setSelectedApp(app); setShowRejectModal(true); }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          ✗ {L.reject}
                        </button>
                      </>
                    )}
                    {app.quotation_link && app.quotation_link.split(', ').filter(Boolean).map((link, i, arr) => (
                      <a key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                      >
                        {arr.length > 1 ? `${L.viewQuotation} ${i+1}` : L.viewQuotation}
                      </a>
                    ))}
                    <button
                      onClick={() => setSelectedApp(selectedApp?.rowIndex === app.rowIndex ? null : app)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                      {selectedApp?.rowIndex === app.rowIndex ? L.hideDetails : L.viewDetails}
                    </button>
                  </div>

                  {selectedApp?.rowIndex === app.rowIndex && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">{L.submitTime}</p>
                        <p className="font-medium mt-0.5">{app.timestamp}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{L.expectedDate}</p>
                        <p className="font-medium mt-0.5">{app.estimated_payment_date || L.notSpecified}</p>
                      </div>
                      {app.supplier_name && (
                        <div>
                          <p className="text-xs text-gray-400">{L.supplierName}</p>
                          <p className="font-medium mt-0.5">{app.supplier_name}</p>
                        </div>
                      )}
                      {app.bank_name && (
                        <div>
                          <p className="text-xs text-gray-400">{L.bankName} / {L.bankAccount}</p>
                          <p className="font-medium mt-0.5">{app.bank_name} {app.bank_account_number}</p>
                        </div>
                      )}
                      {app.claimants && (() => {
                        try {
                          const rows = JSON.parse(app.claimants) as ClaimantRow[];
                          if (rows.length > 0) return (
                            <div className="sm:col-span-2">
                              <p className="text-xs text-gray-400 mb-1">{L.claimants}</p>
                              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-50 text-xs text-gray-500">
                                  <tr>
                                    <th className="px-3 py-2 text-left font-medium">{L.claimantName}</th>
                                    <th className="px-3 py-2 text-left font-medium">{L.claimantDesc}</th>
                                    <th className="px-3 py-2 text-right font-medium">{L.claimantAmount}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.map((r, i) => (
                                    <tr key={i} className="border-t border-gray-100">
                                      <td className="px-3 py-2">{r.name}</td>
                                      <td className="px-3 py-2 text-gray-600">{r.description}</td>
                                      <td className="px-3 py-2 text-right font-medium">HKD {(parseFloat(r.amount||'0')).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        } catch {}
                        return null;
                      })()}
                      {!app.claimants && app.payment_details && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-400">{L.fullDetails}</p>
                          <p className="font-medium mt-0.5 whitespace-pre-wrap">{app.payment_details}</p>
                        </div>
                      )}
                      {app.quotation_link && (
                        <div className="sm:col-span-2 mt-2">
                          <p className="text-xs text-gray-400 mb-1">{L.quotationPreview}</p>
                          <div className="flex flex-wrap gap-2">
                            {app.quotation_link.split(', ').filter(Boolean).map((link, i, arr) => (
                              isImageUrl(link) ? (
                                <img key={i} src={link} alt={`Quotation ${i+1}`} className="max-w-xs rounded-lg border border-gray-200" />
                              ) : (
                                <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                                >
                                  {arr.length > 1 ? `${L.viewQuotation} ${i+1}` : L.viewQuotation} ↗
                                </a>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{L.rejectTitle}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {L.applicant}<span className="font-medium text-gray-700">{selectedApp.staff_name}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {L.rejectReason} <span className="text-red-500">*</span>
                <span className="font-normal text-gray-400 ml-1">{L.rejectMin}</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder={L.rejectPlaceholder}
              />
              <p className="text-xs text-gray-400 mt-1">{rejectionReason.length} / 20</p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectionReason(''); setSelectedApp(null); }}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                >
                  {L.cancel}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || rejectionReason.length < 20}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? L.processing : L.confirmReject}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
