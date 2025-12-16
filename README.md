# 費用申請審批看板 Expense Claim Approval Dashboard

簡潔的申請審批系統，支援快速切換不同的 Google Sheets。

## ✨ 主要功能

- ✅ 從 Google Sheets 讀取費用申請記錄
- ✅ 核准/拒絕申請（直接更新 Google Sheet）
- ✅ 狀態篩選（待處理/已核准/已拒絕）
- ✅ 快速搜尋（姓名、ID、部門、申請目的）
- ✅ **支援切換不同 Google Sheets**（只需修改配置文件）

---

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置 Google Sheets API

#### 2.1 創建 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案
3. 啟用 **Google Sheets API**

#### 2.2 創建 Service Account

1. 在「憑證」頁面，點擊「創建憑證」→ 「服務帳戶」
2. 填寫服務帳戶名稱，點擊「創建並繼續」
3. 跳過權限設定，點擊「完成」
4. 點擊創建的服務帳戶，進入「金鑰」頁籤
5. 點擊「新增金鑰」→ 「JSON」
6. 下載 JSON 文件

#### 2.3 共享 Google Sheet

1. 打開你的 Google Sheet
2. 點擊右上角「共用」
3. 將 Service Account 的電子郵件（類似 `xxx@xxx.iam.gserviceaccount.com`）加入共享
4. 權限設為「編輯者」

### 3. 配置環境變數

複製 `.env.example` 並重命名為 `.env`：

```bash
cp .env.example .env
```

編輯 `.env` 文件，填入從 JSON 文件中獲取的資訊：

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
```

### 4. 配置 Google Sheet

編輯 `sheet-config.json`：

```json
{
  "sheetId": "你的 Google Sheet ID",
  "sheetName": "工作表名稱",
  "approvalStatusColumn": 13
}
```

**如何取得 Sheet ID？**
從 Google Sheets URL 複製：
```
https://docs.google.com/spreadsheets/d/{THIS_IS_THE_SHEET_ID}/edit
```

### 5. 運行開發伺服器

```bash
npm run dev
```

打開瀏覽器訪問: `http://localhost:3000`

---

## 🔄 如何切換到另一個 Google Sheet

這是系統的核心設計！非常簡單：

### 方法 1：修改配置文件（推薦）

只需編輯 `sheet-config.json`：

```json
{
  "sheetId": "NEW_SHEET_ID_HERE",
  "sheetName": "Sheet1",
  "fieldMapping": {
    "Timestamp": "timestamp",
    "Employee Full Name": "employee_full_name",
    ...
  }
}
```

**重要**：如果新 Sheet 的欄位名稱不同，更新 `fieldMapping`。

### 方法 2：使用環境變數覆蓋

在 `.env` 中添加：

```env
GOOGLE_SHEET_ID=NEW_SHEET_ID_HERE
```

這會覆蓋 `sheet-config.json` 中的設定。

### 確認欄位映射

確保新 Sheet 包含以下欄位（或更新 `fieldMapping`）：

1. Timestamp
2. Employee Full Name
3. Employee ID
4. Department/Team
5. Date of Submission
6. Purpose of Claim
7. Expense Category
8. Date of Expense
9. Total Amount Claimed
10. Itemized Breakdown
11. Upload Receipts
12. Policy Confirmation
13. **Approval Status** ← 系統會更新這個欄位

---

## 📁 專案結構

```
account-ui/
├── app/
│   ├── api/
│   │   ├── applications/route.ts   # 讀取申請記錄 API
│   │   └── update-status/route.ts  # 更新狀態 API
│   ├── globals.css                  # 全局樣式
│   ├── layout.tsx                   # 主佈局
│   └── page.tsx                     # 申請看板頁面
├── lib/
│   └── google-sheets.ts             # Google Sheets API 工具
├── sheet-config.json                # 📝 Sheet 配置（可切換）
├── .env                             # 🔒 環境變數（不提交到 git）
└── README.md
```

---

## 🎯 使用說明

### 查看申請

- 自動載入所有申請記錄
- 按狀態篩選：全部 / 待處理 / 已核准 / 已拒絕
- 搜尋框：輸入員工姓名、ID、部門或申請目的

### 核准申請

1. 找到待處理的申請
2. 點擊「✓ 核准」按鈕
3. 確認操作
4. 系統會自動更新 Google Sheet 的審批狀態欄位

### 拒絕申請

1. 找到待處理的申請
2. 點擊「✗ 拒絕」按鈕
3. 填寫拒絕原因（至少 20 字）
4. 確認操作
5. 系統會更新狀態並記錄拒絕原因

### 查看詳情

點擊「查看詳情」按鈕可以展開完整資訊：
- 時間戳記
- 費用日期
- 收據/文件連結
- 政策確認

---

## 🔧 API 文檔

### GET /api/applications

讀取所有申請記錄。

**回應範例：**
```json
{
  "success": true,
  "data": [
    {
      "rowIndex": 2,
      "employee_full_name": "John Doe",
      "total_amount_claimed": 850,
      "approval_status": "PENDING",
      ...
    }
  ]
}
```

### POST /api/update-status

更新審批狀態。

**請求範例：**
```json
{
  "rowIndex": 2,
  "status": "APPROVED"
}
```

或拒絕：
```json
{
  "rowIndex": 3,
  "status": "REJECTED",
  "rejectionReason": "預算不足，請重新規劃申請項目"
}
```

---

## ⚠️ 注意事項

### Google Sheets API 配額

- 每分鐘限制 60 次讀取請求
- 如果使用頻繁，考慮增加快取機制

### 安全性

- **不要**將 `.env` 文件提交到 Git
- Service Account 金鑰要妥善保管
- 只給 Service Account 必要的權限（只共享需要的 Sheet）

### 欄位映射

- 如果 Sheet 欄位名稱改變，記得更新 `sheet-config.json`
- `approvalStatusColumn` 是審批狀態欄位的編號（從 1 開始）

---

## 🐛 故障排除

### 錯誤：Failed to fetch applications

**原因**：Google Sheets API 配置問題

**解決方案**：
1. 檢查 `.env` 文件是否正確設置
2. 確認 Service Account 已加入 Sheet 共享
3. 確認 Google Sheets API 已啟用

### 錯誤：name can only contain URL-friendly characters

**原因**：專案名稱不符合 npm 規範

**解決方案**：已自動處理，專案名稱會轉換為 `account-ui`

### 找不到 Sheet 或欄位錯誤

**原因**：`sheet-config.json` 配置不正確

**解決方案**：
1. 確認 `sheetId` 正確
2. 確認 `sheetName` 與 Google Sheet 的工作表名稱一致
3. 檢查 `fieldMapping` 是否與實際欄位名稱匹配

---

## 📊 部署

### Vercel 部署（推薦）

1. 推送代碼到 GitHub
2. 在 Vercel 導入專案
3. 設置環境變數：
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
4. 部署

---

## 🎉 完成！

系統現在已經可以使用了！

- 📋 查看申請列表
- ✅ 核准/拒絕申請
- 🔄 自動同步到 Google Sheets
- 🔀 隨時切換不同的 Sheet（修改 `sheet-config.json`）

---

## 📝 License

ISC
