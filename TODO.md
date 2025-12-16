# Internal Staff Expense Claim 審批系統 - 開發任務清單

基於實際 Google Sheets 表單欄位的開發指南

---

## 📋 Google Sheets 欄位對應

實際表單包含以下欄位：
1. **Timestamp** - 時間戳記
2. **Employee Full Name** - 員工姓名
3. **Employee ID** - 員工編號
4. **Department/Team** - 部門/團隊
5. **Date of Submission** - 提交日期
6. **Purpose of Claim** - 申請目的簡述
7. **Expense Category** - 費用類別
8. **Date of Expense** - 費用日期
9. **Total Amount Claimed** - 申請總金額
10. **Itemized Breakdown** - 費用明細
11. **Upload Receipts/Supporting Documents** - 上傳收據/支持文件
12. **Policy Confirmation** - 確認聲明（checkbox）
13. **For Office Use Only: Approval Status** - 審批狀態

---

## 階段 1: 環境設置與基礎配置 (60分鐘)

### 1.1 Google Sheets API 配置 (30分鐘)
- [ ] 在 Google Cloud Console 創建新項目
- [ ] 啟用 Google Sheets API
- [ ] 創建 Service Account 並下載 JSON 金鑰
- [ ] 將 Service Account 電子郵件加入到 Google Sheet 的共享權限
- [ ] 測試 API 連接並讀取 Sheet 數據

**驗證步驟**：
```javascript
// 測試讀取 Sheet 的第一行數據
const rows = await sheets.spreadsheets.values.get({
  spreadsheetId: 'YOUR_SHEET_ID',
  range: 'Sheet1!A1:M2',
});
console.log(rows.data.values);
```

### 1.2 專案初始化 (30分鐘)
- [ ] 初始化 Next.js 專案 (`npx create-next-app@latest`)
- [ ] 安裝必要依賴：
  ```bash
  npm install googleapis dotenv
  npm install @supabase/supabase-js
  npm install date-fns
  ```
- [ ] 創建 `.env.local` 文件並設置環境變數：
  ```
  GOOGLE_SHEET_ID=your_sheet_id
  GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@...
  GOOGLE_PRIVATE_KEY=your_private_key
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  ```

---

## 階段 2: 後端 API 開發 (120分鐘)

### 2.1 Google Sheets 數據同步 API (60分鐘)

**檔案**: `pages/api/sync-sheet.js`

- [ ] 實現從 Google Sheets 讀取所有申請記錄
- [ ] 將欄位名稱映射到資料庫欄位：
  ```javascript
  const fieldMapping = {
    'Timestamp': 'timestamp',
    'Employee Full Name': 'employee_full_name',
    'Employee ID': 'employee_id',
    'Department/Team': 'department_team',
    'Date of Submission': 'date_of_submission',
    'Purpose of Claim (Brief Description)': 'purpose_of_claim',
    'Expense Category': 'expense_category',
    'Date of Expense': 'date_of_expense',
    'Total Amount Claimed (in local currency)': 'total_amount_claimed',
    'Please provide an itemized breakdown of expenses (if multiple items under one claim)': 'itemized_breakdown',
    'Upload Receipts/Supporting Documents (e.g., invoices, tickets)': 'receipt_urls',
    'I confirm that these expenses are legitimate, incurred for business purposes, and comply with the company\'s expense policy.': 'policy_confirmation',
    'For Office Use Only: Approval Status': 'approval_status'
  };
  ```
- [ ] 處理收據 URL 欄位（Google Drive 連結提取）
- [ ] 實現錯誤處理和重試邏輯

**測試要點**：
- 空值處理（某些欄位可能為空）
- 日期格式轉換
- 金額格式處理（移除貨幣符號）

### 2.2 審批狀態更新 API (30分鐘)

**檔案**: `pages/api/update-approval.js`

- [ ] 實現更新 Google Sheet 的審批狀態欄位
- [ ] 支援批量更新（批量核准功能）
- [ ] 記錄審批人和審批時間
- [ ] 同步更新到 Supabase 資料庫

**API 端點**：
```javascript
POST /api/update-approval
Body: {
  applicationId: "row_id",
  status: "APPROVED" | "REJECTED",
  rejectionReason?: "string",
  approvedBy: "principal_name"
}
```

### 2.3 附件處理 API (30分鐘)

**檔案**: `pages/api/get-attachments.js`

- [ ] 解析 Google Drive 連結
- [ ] 生成預覽連結（如果可能）
- [ ] 實現批量下載功能
- [ ] 處理權限問題（確保校長可以訪問）

---

## 階段 3: 資料庫設置 (45分鐘)

### 3.1 Supabase 表結構創建 (20分鐘)

在 Supabase SQL Editor 中執行：

```sql
-- 主申請表
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sheet_row_id INT UNIQUE, -- Google Sheet 的行號
  timestamp TIMESTAMPTZ NOT NULL,
  employee_full_name TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  department_team TEXT NOT NULL,
  date_of_submission DATE NOT NULL,
  purpose_of_claim TEXT NOT NULL,
  expense_category TEXT NOT NULL,
  date_of_expense DATE NOT NULL,
  total_amount_claimed NUMERIC(10,2) NOT NULL,
  itemized_breakdown TEXT,
  receipt_urls TEXT[],
  policy_confirmation BOOLEAN DEFAULT FALSE,
  approval_status TEXT DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING','APPROVED','REJECTED')),
  rejection_reason TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_approval_status ON applications(approval_status);
CREATE INDEX idx_employee_id ON applications(employee_id);
CREATE INDEX idx_date_of_submission ON applications(date_of_submission DESC);
CREATE INDEX idx_expense_category ON applications(expense_category);

-- 自動更新時間戳
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 3.2 Row Level Security (RLS) 設置 (15分鐘)

```sql
-- 啟用 RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 校長可以查看和修改所有記錄
CREATE POLICY "Principal full access" ON applications
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'principal');

-- 員工只能查看自己的申請
CREATE POLICY "Employee view own" ON applications
  FOR SELECT
  USING (auth.jwt() ->> 'email' = employee_id);
```

### 3.3 同步機制測試 (10分鐘)

- [ ] 測試從 Google Sheets 導入數據
- [ ] 驗證欄位映射正確性
- [ ] 測試增量同步（只同步新的申請）

---

## 階段 4: 前端開發 (180分鐘)

### 4.1 校長儀表板頁面 (90分鐘)

**檔案**: `pages/dashboard.js`

#### 4.1.1 申請列表顯示 (45分鐘)

- [ ] 創建申請卡片組件 (`components/ApplicationCard.js`)
  - 顯示: Employee Name, Employee ID, Department, Purpose, Amount, Date
  - 狀態顏色標記（PENDING=黃, APPROVED=綠, REJECTED=紅）
  - 急件標記（金額 > $1000）

- [ ] 實現篩選功能：
  - 按狀態篩選（All / Pending / Approved / Rejected）
  - 按部門篩選
  - 按費用類別篩選
  - 按日期範圍篩選

- [ ] 實現排序功能：
  - 按提交日期（預設：最新優先）
  - 按金額（高到低 / 低到高）
  - 按員工 ID

#### 4.1.2 申請詳情模態框 (25分鐘)

**檔案**: `components/ApplicationDetailModal.js`

- [ ] 顯示所有表單欄位：
  ```
  - Employee Full Name
  - Employee ID
  - Department/Team
  - Date of Submission
  - Purpose of Claim
  - Expense Category
  - Date of Expense
  - Total Amount Claimed
  - Itemized Breakdown (顯示為格式化文本)
  - Receipts/Documents (顯示為可點擊連結)
  - Policy Confirmation (顯示 checkbox 狀態)
  - Approval Status
  ```

- [ ] 附件預覽功能
- [ ] 顯示審批歷史（如果有）

#### 4.1.3 審批操作 (20分鐘)

**檔案**: `components/ApprovalActions.js`

- [ ] 核准按鈕（綠色）
  - 雙因素確認彈窗
  - 可選填核准備註

- [ ] 拒絕按鈕（紅色）
  - 強制填寫拒絕原因（至少 20 字）
  - 預設原因模板：
    - "預算不足，請重新規劃"
    - "缺少必要文件，請補充"
    - "不符合費用政策"
    - "金額超出核准權限"
    - "其他（請說明）"

- [ ] 批量核准功能
  - 選擇多個申請
  - 一鍵核准同類別小額申請（< $500）

### 4.2 統計數據面板 (45分鐘)

**檔案**: `components/StatisticsPanel.js`

- [ ] 顯示關鍵指標：
  - 待處理申請數量
  - 本月已核准金額
  - 本月已拒絕數量
  - 平均處理時間

- [ ] 部門預算追蹤
  - 各部門已使用預算
  - 預算超支警告（紅色標記）

- [ ] 費用類別統計
  - 按類別顯示金額分布（圓餅圖）
  - 使用 `recharts` 或 `chart.js`

### 4.3 搜尋功能 (25分鐘)

**檔案**: `components/SearchBar.js`

- [ ] 即時搜尋（debounce 300ms）
- [ ] 搜尋範圍：
  - Employee Name
  - Employee ID
  - Purpose of Claim
  - Department

### 4.4 響應式設計優化 (20分鐘)

- [ ] 手機版布局調整
- [ ] 平板版布局
- [ ] 觸控優化（按鈕大小、間距）

---

## 階段 5: 進階功能 (90分鐘)

### 5.1 即時同步 (30分鐘)

**使用 Supabase Realtime**

```javascript
const subscription = supabase
  .from('applications')
  .on('UPDATE', payload => {
    // 更新前端顯示
    updateApplicationList(payload.new);
  })
  .subscribe();
```

- [ ] 實現即時狀態更新
- [ ] 顯示其他管理員正在審批的申請（防止衝突）
- [ ] 新申請通知

### 5.2 匯出報表功能 (30分鐘)

**檔案**: `pages/api/export-report.js`

- [ ] 匯出為 Excel（使用 `xlsx` library）
  - 自定義日期範圍
  - 按狀態篩選
  - 按部門篩選

- [ ] 匯出為 PDF（使用 `jspdf` + `jspdf-autotable`）
  - 包含公司 logo
  - 格式化金額和日期
  - 添加頁碼和生成日期

### 5.3 審計日誌 (30分鐘)

**新增表**: `audit_logs`

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id),
  action TEXT NOT NULL, -- 'APPROVED', 'REJECTED', 'VIEWED'
  performed_by TEXT NOT NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  details JSONB
);

CREATE INDEX idx_audit_logs_app_id ON audit_logs(application_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(performed_at DESC);
```

- [ ] 記錄所有審批操作
- [ ] 記錄查看記錄（compliance）
- [ ] 7 年保留策略（自動歸檔）

---

## 階段 6: 測試與部署 (60分鐘)

### 6.1 單元測試 (30分鐘)

- [ ] API 端點測試（Jest + Supertest）
- [ ] 數據同步邏輯測試
- [ ] 審批流程測試

**關鍵測試案例**：
```javascript
// 測試拒絕原因驗證
test('拒絕申請時必須提供至少20字的原因', async () => {
  const result = await rejectApplication('app-001', '太短');
  expect(result.error).toBe('拒絕原因至少需要20字');
});

// 測試金額閾值
test('金額超過 $1000 應標記為高優先級', () => {
  const app = { totalAmountClaimed: 1500 };
  expect(isHighPriority(app)).toBe(true);
});
```

### 6.2 整合測試 (15分鐘)

- [ ] Google Sheets 同步測試
- [ ] Supabase RLS 權限測試
- [ ] 前後端整合測試

### 6.3 部署 (15分鐘)

- [ ] Vercel 部署設置
- [ ] 環境變數配置
- [ ] 自定義域名設置（如果需要）

**部署檢查清單**：
```bash
# 環境變數確認
✓ GOOGLE_SHEET_ID
✓ GOOGLE_SERVICE_ACCOUNT_EMAIL
✓ GOOGLE_PRIVATE_KEY
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY

# 部署命令
npm run build
vercel --prod
```

---

## 階段 7: 用戶培訓與文檔 (30分鐘)

### 7.1 使用手冊 (15分鐘)

**檔案**: `docs/USER_GUIDE.md`

- [ ] 校長操作指南
  - 如何登入
  - 如何篩選申請
  - 如何核准/拒絕
  - 如何匯出報表

- [ ] 常見問題 FAQ

### 7.2 技術文檔 (15分鐘)

**檔案**: `docs/TECHNICAL.md`

- [ ] API 文檔
- [ ] 資料庫 Schema
- [ ] 部署流程
- [ ] 故障排除指南

---

## 📊 時間總估算

| 階段 | 預計時間 | 累計時間 |
|------|---------|---------|
| 環境設置 | 60分鐘 | 60分鐘 |
| 後端 API | 120分鐘 | 180分鐘 |
| 資料庫 | 45分鐘 | 225分鐘 |
| 前端開發 | 180分鐘 | 405分鐘 |
| 進階功能 | 90分鐘 | 495分鐘 |
| 測試部署 | 60分鐘 | 555分鐘 |
| 文檔培訓 | 30分鐘 | 585分鐘 |
| **總計** | **約 9.75 小時** | **585分鐘** |

---

## 🎯 優先級建議

### Phase 1 - MVP（最小可行產品）- 5 小時
1. ✅ Google Sheets API 連接
2. ✅ 基礎資料庫設置
3. ✅ 申請列表顯示
4. ✅ 核准/拒絕功能
5. ✅ 簡單的篩選和搜尋

### Phase 2 - 增強功能 - 3 小時
1. ✅ 統計數據面板
2. ✅ 批量操作
3. ✅ 即時同步
4. ✅ 匯出報表

### Phase 3 - 進階功能 - 2 小時
1. ✅ 審計日誌
2. ✅ 進階篩選
3. ✅ 響應式優化
4. ✅ 用戶培訓

---

## ⚠️ 風險與注意事項

### 技術風險
1. **Google Sheets API 配額限制**
   - 解決方案: 實現本地快取，減少 API 呼叫
   - 配額: 每分鐘 60 次讀取請求

2. **同步衝突**
   - 場景: Google Sheet 和 Supabase 同時被修改
   - 解決方案: 實現 Last-Write-Wins 策略，並記錄衝突日誌

3. **大量數據性能**
   - 問題: 如果有超過 1000 筆申請記錄
   - 解決方案: 實現分頁載入（每頁 50 筆）

### 安全性考量
1. **敏感資訊保護**
   - 員工 ID 和金額為敏感資訊
   - 實現 HTTPS only
   - 使用 Supabase RLS

2. **權限控制**
   - 確保只有校長可以審批
   - 員工只能查看自己的申請

---

## 📚 技術棧總結

- **前端**: Next.js 14, React, Tailwind CSS
- **後端**: Next.js API Routes
- **資料庫**: Supabase (PostgreSQL)
- **外部服務**: Google Sheets API
- **部署**: Vercel
- **圖表**: Recharts 或 Chart.js
- **匯出**: xlsx, jspdf

---

## 🚀 快速開始命令

```bash
# 1. Clone 或初始化專案
npx create-next-app@latest expense-claim-system

# 2. 安裝依賴
cd expense-claim-system
npm install googleapis @supabase/supabase-js date-fns recharts xlsx jspdf jspdf-autotable

# 3. 設置環境變數
cp .env.example .env.local
# 編輯 .env.local 並填入你的金鑰

# 4. 運行開發伺服器
npm run dev

# 5. 訪問
open http://localhost:3000
```

---

**注意**: 這是一個完整的開發路線圖。實際開發時可以根據需求優先級調整順序。建議先完成 MVP（Phase 1），測試無誤後再添加進階功能。
