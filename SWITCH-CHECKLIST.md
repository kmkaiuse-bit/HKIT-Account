# ✅ 環境切換檢查清單

從測試環境切換到公司正式環境的快速檢查清單。

---

## 📋 切換前準備（由公司提供）

- [ ] 公司 Google Workspace 管理員權限
- [ ] 正式 Google Sheet URL
- [ ] Vercel 帳號存取權限

---

## 🔑 步驟 1: Google Service Account（公司 IT 操作）

- [ ] 登入 Google Cloud Console（使用公司帳號）
- [ ] 建立新專案：`HKIT-Expense-Claim-System`
- [ ] 啟用 Google Sheets API
- [ ] 建立 Service Account：`expense-claim-service`
- [ ] 下載 JSON 金鑰文件
- [ ] 記錄 `client_email`
- [ ] 記錄 `private_key`

---

## 📊 步驟 2: Google Sheet 設置（公司 IT 操作）

- [ ] 從 URL 取得正式 Sheet ID
- [ ] 記錄工作表名稱（例如：`Form Responses 1`）
- [ ] 確認有「審批狀態」欄位
- [ ] 記錄「審批狀態」是第幾欄（從 1 開始）
- [ ] 點擊「共用」
- [ ] 加入 Service Account 的 `client_email`
- [ ] 權限設為「編輯者」
- [ ] 取消勾選「通知使用者」
- [ ] 點擊「傳送」

---

## ⚙️ 步驟 3: Vercel 配置更新（開發者操作）

### 3.1 更新環境變數

- [ ] 登入 Vercel Dashboard
- [ ] 進入專案 → Settings → Environment Variables
- [ ] 更新 `GOOGLE_SERVICE_ACCOUNT_EMAIL`（改成公司的）
- [ ] 更新 `GOOGLE_PRIVATE_KEY`（改成公司的）
- [ ] 確認兩個變數都勾選了 Production, Preview, Development
- [ ] 點擊 Save

### 3.2 更新 Sheet 配置

- [ ] 前往 GitHub 倉庫
- [ ] 編輯 `sheet-config.json`
- [ ] 更新 `sheetId`（改成公司的）
- [ ] 更新 `sheetName`（改成實際的工作表名稱）
- [ ] 確認 `approvalStatusColumn` 正確
- [ ] 如果欄位名稱不同，更新 `fieldMapping`
- [ ] Commit 並 Push

### 3.3 觸發重新部署

- [ ] Vercel 自動偵測到 GitHub 更新
- [ ] 等待部署完成（約 1-2 分鐘）
- [ ] 狀態變為「Ready」

---

## 🧪 步驟 4: 測試驗證（開發者 + IT 操作）

### 4.1 基本功能

- [ ] 訪問正式網站 URL
- [ ] 頁面可以載入
- [ ] 顯示公司 Google Sheet 的實際數據
- [ ] 數據筆數正確

### 4.2 篩選和搜尋

- [ ] 狀態篩選功能正常（全部/待處理/已核准/已拒絕）
- [ ] 搜尋功能正常（姓名/ID/部門）
- [ ] 點擊「查看詳情」可以展開

### 4.3 核准功能測試

- [ ] 選擇一個「待處理」的申請
- [ ] 點擊「核准」按鈕
- [ ] 確認彈窗出現
- [ ] 點擊確認
- [ ] 頁面狀態更新為「已核准」
- [ ] **打開 Google Sheet，確認「審批狀態」欄位 = `APPROVED`**

### 4.4 拒絕功能測試

- [ ] 選擇一個「待處理」的申請
- [ ] 點擊「拒絕」按鈕
- [ ] 填寫拒絕原因（至少 20 字）
- [ ] 點擊確認
- [ ] 頁面狀態更新為「已拒絕」
- [ ] **打開 Google Sheet，確認「審批狀態」欄位 = `REJECTED`**

### 4.5 權限測試

- [ ] Service Account 可以讀取數據
- [ ] Service Account 可以寫入「審批狀態」
- [ ] 測試多筆申請的核准/拒絕

---

## 🔒 步驟 5: 安全性檢查

- [ ] Vercel 環境變數已加密存儲
- [ ] JSON 金鑰文件已妥善保管（不在 Git 中）
- [ ] Service Account 只能訪問指定的 Google Sheet
- [ ] 網站使用 HTTPS
- [ ] （可選）啟用 Vercel Authentication

---

## 📢 步驟 6: 上線通知

- [ ] 記錄正式網站 URL
- [ ] 通知校長或相關使用者
- [ ] 提供使用說明（`README.md`）
- [ ] 設置技術支援聯絡方式

---

## 📝 記錄資訊

### 公司環境資訊

```
Google Cloud 專案名稱：_____________________
Service Account Email：_____________________
Google Sheet ID：_____________________
工作表名稱：_____________________
正式網站 URL：_____________________
切換日期：_____________________
```

### 測試環境資訊（備份）

```
測試 Sheet ID：_____________________
測試 Service Account：_____________________
```

---

## 🆘 如果遇到問題

### 問題 1: 頁面載入但沒有數據
**檢查**：
- [ ] Service Account 是否已加入 Sheet 共享
- [ ] Sheet ID 是否正確
- [ ] 工作表名稱是否正確

### 問題 2: 無法更新審批狀態
**檢查**：
- [ ] Service Account 權限是否為「編輯者」
- [ ] `approvalStatusColumn` 是否正確
- [ ] 是否有「審批狀態」欄位

### 問題 3: 環境變數錯誤
**檢查**：
- [ ] Vercel 環境變數是否正確設置
- [ ] `GOOGLE_PRIVATE_KEY` 是否完整（包括 BEGIN 和 END）
- [ ] 是否已重新部署

---

## ✅ 切換完成

當所有項目都勾選完成，系統即可正式使用！

**預計總時間**：30 分鐘
**負責人**：公司 IT + 開發者

---

**使用完整指南**：查看 `COMPANY-SETUP-GUIDE.md` 獲取詳細步驟說明。
