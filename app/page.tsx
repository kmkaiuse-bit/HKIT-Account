'use client';

import { useEffect, useState } from 'react';

interface Application {
  rowIndex: number;
  timestamp: string;
  date: string;
  staff_name: string;
  payment_details: string;
  payment_total_amount: number;
  remark: string;
  centre: string;
  programme: string;
  term: string;
  edb_funding: string;
  estimated_payment_date: string;
  approval_status: string;
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // 載入申請資料
  useEffect(() => {
    fetchApplications();
  }, []);

  // 篩選和搜尋
  useEffect(() => {
    let filtered = applications;

    // 狀態篩選
    if (filter !== 'all') {
      filtered = filtered.filter(app => app.approval_status.toUpperCase() === filter.toUpperCase());
    }

    // 搜尋
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.staff_name.toLowerCase().includes(query) ||
        app.payment_details.toLowerCase().includes(query) ||
        app.centre.toLowerCase().includes(query) ||
        app.programme.toLowerCase().includes(query) ||
        app.term.toLowerCase().includes(query)
      );
    }

    setFilteredApps(filtered);
  }, [applications, filter, searchQuery]);

  async function fetchApplications() {
    try {
      const response = await fetch('/api/applications');
      const data = await response.json();
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(app: Application) {
    if (!confirm(`確認核准 ${app.staff_name} 的付款申請？`)) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: app.rowIndex,
          status: 'APPROVED'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('已核准！');
        await fetchApplications(); // 重新載入數據
      } else {
        alert('操作失敗：' + data.error);
      }
    } catch (error) {
      alert('操作失敗');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedApp) return;

    if (rejectionReason.length < 20) {
      alert('拒絕原因至少需要 20 個字元');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: selectedApp.rowIndex,
          status: 'REJECTED',
          rejectionReason
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('已拒絕');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedApp(null);
        await fetchApplications();
      } else {
        alert('操作失敗：' + data.error);
      }
    } catch (error) {
      alert('操作失敗');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status.toUpperCase()) {
      case 'APPROVED': return 'text-green-600 bg-green-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  function getStatusText(status: string) {
    switch (status.toUpperCase()) {
      case 'APPROVED': return '已核准';
      case 'REJECTED': return '已拒絕';
      case 'PENDING': return '待處理';
      default: return status;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 標題欄 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">付款申請審批看板</h1>
          <p className="text-sm text-gray-500 mt-1">Payment Request Approval Dashboard</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 篩選和搜尋 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">狀態篩選</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有狀態</option>
                <option value="pending">待處理</option>
                <option value="approved">已核准</option>
                <option value="rejected">已拒絕</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜尋</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="員工姓名、付款詳情、中心、課程、學期..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              顯示 <span className="font-medium">{filteredApps.length}</span> 筆申請
              （共 {applications.length} 筆）
            </p>
            <button
              onClick={fetchApplications}
              className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
            >
              🔄 重新整理
            </button>
          </div>
        </div>

        {/* 申請列表 */}
        <div className="space-y-4">
          {filteredApps.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">沒有符合條件的申請</p>
            </div>
          ) : (
            filteredApps.map((app) => (
              <div key={app.rowIndex} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{app.payment_details}</h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>👤 {app.staff_name}</p>
                            <p>🏫 {app.centre}</p>
                            <p>📚 {app.programme}</p>
                            <p>📅 日期: {app.date}</p>
                            <p>📆 學期: {app.term}</p>
                            <p>💰 資助: {app.edb_funding}</p>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-2xl font-bold ${app.payment_total_amount > 1000 ? 'text-red-600' : 'text-gray-900'}`}>
                            ${app.payment_total_amount.toLocaleString()}
                          </p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(app.approval_status)}`}>
                            {getStatusText(app.approval_status)}
                          </span>
                        </div>
                      </div>

                      {/* 備註 */}
                      {app.remark && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <p className="text-xs font-medium text-gray-700 mb-1">備註：</p>
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap">{app.remark}</pre>
                        </div>
                      )}

                      {/* 操作按鈕 */}
                      {app.approval_status.toUpperCase() === 'PENDING' && (
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => handleApprove(app)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ✓ 核准
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowRejectModal(true);
                            }}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ✗ 拒絕
                          </button>
                          <button
                            onClick={() => setSelectedApp(selectedApp?.rowIndex === app.rowIndex ? null : app)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                          >
                            {selectedApp?.rowIndex === app.rowIndex ? '收起詳情' : '查看詳情'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 詳細資訊（展開） */}
                  {selectedApp?.rowIndex === app.rowIndex && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">提交時間</p>
                          <p className="text-sm font-medium">{app.timestamp}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">預計付款日期</p>
                          <p className="text-sm font-medium">{app.estimated_payment_date || '未指定'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500">完整付款詳情</p>
                          <p className="text-sm font-medium whitespace-pre-wrap">{app.payment_details}</p>
                        </div>
                        {app.remark && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-500">額外備註</p>
                            <p className="text-sm font-medium whitespace-pre-wrap">{app.remark}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 拒絕模態框 */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">拒絕付款申請</h3>
              <p className="text-sm text-gray-600 mb-4">
                申請人: <span className="font-medium">{selectedApp.staff_name}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                拒絕原因 <span className="text-red-600">*</span>（至少 20 字）
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="請詳細說明拒絕理由..."
              />
              <p className="text-xs text-gray-500 mt-1">
                目前字數: {rejectionReason.length}/20
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedApp(null);
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || rejectionReason.length < 20}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
