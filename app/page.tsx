'use client';

import { useEffect, useRef, useState } from 'react';

interface Application {
  rowIndex: number;
  timestamp: string;
  date: string;
  staff_name: string;
  payment_details: string;
  payment_total_amount: number | undefined;
  remark: string;
  centre: string;
  programme: string;
  term: string;
  edb_funding: string;
  estimated_payment_date: string;
  approval_status: string;
  quotation_link: string;
}

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
  payment_details: '',
  payment_total_amount: '',
  edb_funding: '',
  estimated_payment_date: '',
  remark: '',
};

export default function Dashboard() {
  // ── Shared ──────────────────────────────────────────────
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>('staff');

  // ── Staff form ──────────────────────────────────────────
  const [form, setForm] = useState(emptyForm);
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Principal ───────────────────────────────────────────
  const [showAllPrincipal, setShowAllPrincipal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchApplications(); }, []);

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

  // ── Staff: submit form ───────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (quotationFile) fd.append('quotation', quotationFile);

      const res = await fetch('/api/submit', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.success) {
        const msg = data.warning
          ? `申請已成功提交，但報價單未能上傳：${data.warning}`
          : '申請已成功提交！稍後可在校長審批頁查看狀態。';
        setSubmitResult({ ok: true, msg });
        setForm(emptyForm);
        setQuotationFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchApplications();
      } else {
        setSubmitResult({ ok: false, msg: '提交失敗：' + data.error });
      }
    } catch {
      setSubmitResult({ ok: false, msg: '提交失敗，請檢查網絡連線後重試。' });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Principal: approve ───────────────────────────────────
  async function handleApprove(app: Application) {
    if (!confirm(`確認核准 ${app.staff_name} 的付款申請？`)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: app.rowIndex, status: 'APPROVED' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('已核准！');
        fetchApplications();
      } else {
        alert('操作失敗：' + data.error);
      }
    } catch {
      alert('操作失敗');
    } finally {
      setActionLoading(false);
    }
  }

  // ── Principal: reject ────────────────────────────────────
  async function handleReject() {
    if (!selectedApp) return;
    if (rejectionReason.length < 20) {
      alert('拒絕原因至少需要 20 個字元');
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
        alert('操作失敗：' + data.error);
      }
    } catch {
      alert('操作失敗');
    } finally {
      setActionLoading(false);
    }
  }

  // ── Helpers ──────────────────────────────────────────────
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
      case 'APPROVED': return '已核准';
      case 'REJECTED': return '已拒絕';
      case 'PENDING':  return '待審批';
      default:         return status || '未知';
    }
  }

  // ── Accounting stats ─────────────────────────────────────
  const totalAmount   = applications.reduce((s, a) => s + (a.payment_total_amount ?? 0), 0);
  const pendingCount  = applications.filter(a => (a.approval_status || '').toUpperCase() === 'PENDING').length;
  const approvedCount = applications.filter(a => (a.approval_status || '').toUpperCase() === 'APPROVED').length;
  const rejectedCount = applications.filter(a => (a.approval_status || '').toUpperCase() === 'REJECTED').length;

  // ── Principal list ───────────────────────────────────────
  const principalList = showAllPrincipal
    ? applications
    : applications.filter(a => (a.approval_status || '').toUpperCase() === 'PENDING');

  // ── Loading screen ───────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">HKIT 付款申請系統</h1>
            <p className="text-sm text-gray-500 mt-0.5">Payment Request Management System</p>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-gray-200 -mb-px">
            {([
              ['staff',      '員工報銷'],
              ['accounting', '會計報表'],
              ['principal',  '校長審批'],
            ] as [Role, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRole(key)}
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          STAFF TAB — 員工報銷
      ══════════════════════════════════════════════════════ */}
      {role === 'staff' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">提交付款申請</h2>
            <p className="text-sm text-gray-500 mb-6">請填寫以下資料，並上傳相關報價單。</p>

            {/* Success / Error banner */}
            {submitResult && (
              <div className={`mb-6 p-4 rounded-lg text-sm ${submitResult.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {submitResult.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    員工姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.staff_name}
                    onChange={e => setForm(f => ({ ...f, staff_name: e.target.value }))}
                    placeholder="Full Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Centre + Programme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    中心 Centre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.centre}
                    onChange={e => setForm(f => ({ ...f, centre: e.target.value }))}
                    placeholder="例：觀塘中心"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    計劃 Programme <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.programme}
                    onChange={e => setForm(f => ({ ...f, programme: e.target.value }))}
                    placeholder="例：STEM 課程"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 3: Term + Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    學期 Term <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.term}
                    onChange={e => setForm(f => ({ ...f, term: e.target.value }))}
                    placeholder="例：2024-25 Term 1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    申請金額 (HKD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.payment_total_amount}
                    onChange={e => setForm(f => ({ ...f, payment_total_amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  付款詳情 Payment Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.payment_details}
                  onChange={e => setForm(f => ({ ...f, payment_details: e.target.value }))}
                  placeholder="請詳細描述付款用途..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Row 4: EDB Funding + Estimated Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EDB 資助</label>
                  <input
                    type="text"
                    value={form.edb_funding}
                    onChange={e => setForm(f => ({ ...f, edb_funding: e.target.value }))}
                    placeholder="如適用"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">預計付款日期</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">備註 Remark</label>
                <textarea
                  rows={2}
                  value={form.remark}
                  onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                  placeholder="其他補充說明（可選）"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Quotation Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  報價單 Quotation
                  <span className="ml-2 text-xs text-gray-400 font-normal">PDF / 圖片（可選）</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={e => setQuotationFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="quotation-upload"
                  />
                  <label htmlFor="quotation-upload" className="cursor-pointer">
                    {quotationFile ? (
                      <div className="text-sm text-blue-600 font-medium">
                        {quotationFile.name}
                        <span className="ml-2 text-gray-400 text-xs">({(quotationFile.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        <span className="text-blue-600 font-medium">點擊上傳</span>
                        <span className="ml-1">或拖放檔案到此處</span>
                      </div>
                    )}
                  </label>
                </div>
                {quotationFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuotationFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-1 text-xs text-red-500 hover:text-red-700"
                  >
                    移除檔案
                  </button>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '提交中...' : '提交申請'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ACCOUNTING TAB — 會計報表
      ══════════════════════════════════════════════════════ */}
      {role === 'accounting' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '申請總數', value: applications.length, color: 'text-gray-900' },
              { label: '申請總額', value: `$${totalAmount.toLocaleString()}`, color: 'text-blue-600' },
              { label: '待審批', value: pendingCount, color: 'text-yellow-600' },
              { label: '已核准', value: approvedCount, color: 'text-green-600' },
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
              共 {applications.length} 筆記錄（{rejectedCount} 已拒絕）
            </p>
            <div className="flex gap-3">
              <button
                onClick={fetchApplications}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                重新整理
              </button>
              <a
                href="/api/export"
                download="payment-requests.xlsx"
                className="px-4 py-2 text-sm bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                下載 Excel
              </a>
            </div>
          </div>

          {/* Data table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['提交時間','日期','員工姓名','付款詳情','金額','中心','計劃','學期','EDB資助','預計付款日期','審批狀態','報價單'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-400">暫無記錄</td>
                    </tr>
                  ) : applications.map(app => (
                    <tr key={app.rowIndex} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{app.timestamp}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{app.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{app.staff_name}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="block truncate" title={app.payment_details}>{app.payment_details}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                        ${(app.payment_total_amount ?? 0).toLocaleString()}
                      </td>
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
                          <a href={app.quotation_link} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs">
                            查看
                          </a>
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
          PRINCIPAL TAB — 校長審批
      ══════════════════════════════════════════════════════ */}
      {role === 'principal' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              {showAllPrincipal
                ? `顯示全部 ${applications.length} 筆申請`
                : `${pendingCount} 筆待審批`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAllPrincipal(v => !v)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {showAllPrincipal ? '只看待審批' : '查看全部'}
              </button>
              <button
                onClick={fetchApplications}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                重新整理
              </button>
            </div>
          </div>

          {/* Application cards */}
          <div className="space-y-4">
            {principalList.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
                {showAllPrincipal ? '暫無申請記錄' : '目前沒有待審批的申請'}
              </div>
            ) : principalList.map(app => (
              <div key={app.rowIndex} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate" title={app.payment_details}>
                        {app.payment_details}
                      </h3>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span>👤 {app.staff_name}</span>
                        <span>🏫 {app.centre}</span>
                        <span>📚 {app.programme}</span>
                        <span>📅 {app.date}</span>
                        <span>📆 {app.term}</span>
                        {app.edb_funding && <span>💰 {app.edb_funding}</span>}
                      </div>
                      {app.remark && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                          <span className="font-medium text-gray-700">備註：</span>{app.remark}
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

                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(app.approval_status || '').toUpperCase() === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(app)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          ✓ 核准
                        </button>
                        <button
                          onClick={() => { setSelectedApp(app); setShowRejectModal(true); }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          ✗ 拒絕
                        </button>
                      </>
                    )}
                    {app.quotation_link && (
                      <a
                        href={app.quotation_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                      >
                        查看報價單
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedApp(selectedApp?.rowIndex === app.rowIndex ? null : app)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                      {selectedApp?.rowIndex === app.rowIndex ? '收起詳情' : '查看詳情'}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {selectedApp?.rowIndex === app.rowIndex && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">提交時間</p>
                        <p className="font-medium mt-0.5">{app.timestamp}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">預計付款日期</p>
                        <p className="font-medium mt-0.5">{app.estimated_payment_date || '未指定'}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs text-gray-400">完整付款詳情</p>
                        <p className="font-medium mt-0.5 whitespace-pre-wrap">{app.payment_details}</p>
                      </div>
                      {app.quotation_link && (
                        <div className="sm:col-span-2 mt-2">
                          <p className="text-xs text-gray-400 mb-2">報價單預覽</p>
                          {isImageUrl(app.quotation_link) ? (
                            <img
                              src={app.quotation_link}
                              alt="Quotation"
                              className="max-w-full rounded-lg border border-gray-200"
                            />
                          ) : (
                            <iframe
                              src={toEmbedUrl(app.quotation_link)}
                              className="w-full h-96 rounded-lg border border-gray-200"
                              title="Quotation Preview"
                            />
                          )}
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
              <h3 className="text-lg font-bold text-gray-900 mb-1">拒絕付款申請</h3>
              <p className="text-sm text-gray-500 mb-4">
                申請人：<span className="font-medium text-gray-700">{selectedApp.staff_name}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                拒絕原因 <span className="text-red-500">*</span>
                <span className="font-normal text-gray-400 ml-1">（至少 20 字）</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="請詳細說明拒絕理由..."
              />
              <p className="text-xs text-gray-400 mt-1">{rejectionReason.length} / 20 字</p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectionReason(''); setSelectedApp(null); }}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || rejectionReason.length < 20}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? '處理中...' : '確認拒絕'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
