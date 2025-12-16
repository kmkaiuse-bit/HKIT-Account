# 🏢 公司正式環境設置指南

本文檔提供給公司 IT 團隊，用於將測試系統切換到正式環境。

---

## 📋 概述

**系統名稱**：費用申請審批看板
**技術架構**：Next.js + Google Sheets API + Vercel
**GitHub 倉庫**：https://github.com/kmkaiuse-bit/HKIT-Account
**目前狀態**：測試環境（使用個人 Google Account）
**目標**：切換到公司 Google Workspace Account

---

## ✅ 公司需要準備的資訊

### 必須項目：

1. **Google Workspace 管理員權限**
   - 需要能建立 Google Cloud 專案
   - 需要能管理 Service Account

2. **正式的 Google Sheet**
   - 費用申請表單回覆的 Google Sheet
   - Sheet URL（取得 Sheet ID）
   - 工作表名稱

3. **Vercel 帳號存取權限**
   - 用於更新環境變數
   - 或由開發者代為操作

---

## 🔑 步驟 1: 建立 Google Service Account（10 分鐘）

### 1.1 前往 Google Cloud Console

訪問：https://console.cloud.google.com/

使用**公司的 Google Workspace 帳號**登入。

### 1.2 建立專案

1. 點擊頂部的專案選擇器
2. 點擊「**新增專案**」
3. 填寫：
   - **專案名稱**：`HKIT-Expense-Claim-System`（或其他公司規範的名稱）
   - **組織**：選擇公司的組織
   - **位置**：選擇適當的資料夾
4. 點擊「**建立**」

### 1.3 啟用 Google Sheets API

1. 在左側選單，點擊「**API 和服務**」→「**程式庫**」
2. 搜尋框輸入：`Google Sheets API`
3. 點擊「**Google Sheets API**」
4. 點擊「**啟用**」

### 1.4 建立 Service Account

1. 左側選單 → 「**API 和服務**」→「**憑證**」
2. 點擊「**建立憑證**」→「**服務帳戶**」
3. 填寫服務帳戶詳細資料：
   - **服務帳戶名稱**：`expense-claim-service`
   - **服務帳戶 ID**：`expense-claim-service`（自動生成）
   - **描述**：`用於費用申請審批系統的 API 存取`
4. 點擊「**建立並繼續**」
5. **授予服務帳戶專案存取權**：跳過（不需要角色）
6. 點擊「**繼續**」
7. **授予使用者此服務帳戶的存取權**：跳過
8. 點擊「**完成**」

### 1.5 下載 JSON 金鑰

1. 在憑證頁面，找到剛建立的服務帳戶
2. 點擊服務帳戶（會進入詳細頁面）
3. 進入「**金鑰**」頁籤
4. 點擊「**新增金鑰**」→「**建立新金鑰**」
5. 選擇金鑰類型：**JSON**
6. 點擊「**建立**」
7. JSON 文件會自動下載到你的電腦

**⚠️ 重要**：
- 妥善保管這個 JSON 文件
- 不要提交到 Git 或公開分享
- 建議存放在公司的密碼管理系統

### 1.6 記錄 Service Account 資訊

打開下載的 JSON 文件，記錄以下資訊：

```json
{
  "type": "service_account",
  "project_id": "hkit-expense-claim-xxxxx",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "expense-claim-service@hkit-expense-claim-xxxxx.iam.gserviceaccount.com",
  ...
}
```

**需要記錄的值**：
- ✅ `client_email`（Service Account 電子郵件）
- ✅ `private_key`（私鑰，完整內容包括 BEGIN 和 END）

---

## 📊 步驟 2: 設置 Google Sheet（5 分鐘）

### 2.1 取得 Sheet ID

從正式的 Google Sheet URL 取得 Sheet ID：

```
https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit
                                        ↑↑↑↑↑↑↑↑↑
                                        這就是 Sheet ID
```

**範例**：
```
Sheet URL: https://docs.google.com/spreadsheets/d/1yB0O7Kdx9y3V6LCZ4PuGuekJiZviYgj9JP2Fe-FT0kY/edit
Sheet ID:  1yB0O7Kdx9y3V6LCZ4PuGuekJiZviYgj9JP2Fe-FT0kY
```

### 2.2 確認工作表名稱

看 Google Sheet 底部的標籤，記錄工作表名稱：
- 常見名稱：`Form Responses 1`、`表單回應 1`、`Sheet1`
- 或其他自定義名稱

### 2.3 確認欄位結構

**必須包含的欄位**（第一行）：

1. Timestamp（時間戳記）
2. Employee Full Name（員工姓名）
3. Employee ID（員工編號）
4. Department/Team（部門/團隊）
5. Date of Submission（提交日期）
6. Purpose of Claim（申請目的）
7. Expense Category（費用類別）
8. Date of Expense（費用日期）
9. Total Amount Claimed（申請總金額）
10. Itemized Breakdown（費用明細）
11. Upload Receipts（收據連結）
12. Policy Confirmation（確認聲明）
13. **Approval Status（審批狀態）** ← 系統會寫入這個欄位

**⚠️ 重要**：
- 如果欄位名稱不同，需要更新配置文件（見步驟 3.3）
- 必須有「審批狀態」欄位（用於系統寫入核准/拒絕結果）

### 2.4 共享 Google Sheet

1. 打開正式的 Google Sheet
2. 點擊右上角「**共用**」按鈕
3. 在「新增使用者和群組」欄位中，貼上 Service Account 的 `client_email`
   ```
   例如：expense-claim-service@hkit-expense-claim-xxxxx.iam.gserviceaccount.com
   ```
4. 權限選擇：「**編輯者**」
5. **取消勾選**「通知使用者」
6. 點擊「**傳送**」

---

## ⚙️ 步驟 3: 更新系統配置（5 分鐘）

### 3.1 更新 Vercel 環境變數

前往 Vercel Dashboard：https://vercel.com/

1. 選擇專案：**HKIT-Account**（或你的專案名稱）
2. 進入「**Settings**」→「**Environment Variables**」
3. 找到現有的環境變數並**編輯**（或刪除後重新添加）

#### 更新變數 1:
```
Name:  GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: expense-claim-service@hkit-expense-claim-xxxxx.iam.gserviceaccount.com
       ↑ 從步驟 1.6 的 JSON 文件取得
```
- 勾選：Production, Preview, Development

#### 更新變數 2:
```
Name:  GOOGLE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
(完整的私鑰內容，包括所有 \n 換行符號)
...
-----END PRIVATE KEY-----
       ↑ 從步驟 1.6 的 JSON 文件取得
```
- 勾選：Production, Preview, Development

**⚠️ 重要**：
- 私鑰必須保留所有的 `\n` 換行符號
- 包含完整的 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`

4. 點擊「**Save**」

### 3.2 更新 GitHub 倉庫配置

#### 方法 A：直接在 GitHub 編輯（推薦）

1. 前往：https://github.com/kmkaiuse-bit/HKIT-Account
2. 找到文件：`sheet-config.json`
3. 點擊文件，然後點擊「✏️ 編輯」圖標
4. 修改以下內容：

```json
{
  "sheetId": "1yB0O7Kdx9y3V6LCZ4PuGuekJiZviYgj9JP2Fe-FT0kY",  ← 改成公司的 Sheet ID
  "sheetName": "Form Responses 1",  ← 改成實際的工作表名稱
  "fieldMapping": {
    ... (如果欄位名稱不同，需要更新，見步驟 3.3)
  },
  "approvalStatusColumn": 13  ← 確認「審批狀態」欄位的位置
}
```

5. 點擊「**Commit changes**」
6. Vercel 會自動偵測並重新部署

#### 方法 B：本地修改後推送

```bash
# 1. Clone 倉庫
git clone https://github.com/kmkaiuse-bit/HKIT-Account.git
cd HKIT-Account

# 2. 編輯 sheet-config.json
notepad sheet-config.json

# 3. 提交並推送
git add sheet-config.json
git commit -m "Update to company production Google Sheet"
git push origin main
```

### 3.3 欄位映射（如果欄位名稱不同）

如果公司的 Google Sheet 欄位名稱與預設不同，需要更新 `fieldMapping`。

**範例**：如果你的 Sheet 使用中文欄位名稱

```json
{
  "sheetId": "公司的SheetID",
  "sheetName": "表單回應 1",
  "fieldMapping": {
    "時間戳記": "timestamp",
    "員工姓名": "employee_full_name",
    "員工編號": "employee_id",
    "部門": "department_team",
    "提交日期": "date_of_submission",
    "申請目的": "purpose_of_claim",
    "費用類別": "expense_category",
    "費用日期": "date_of_expense",
    "申請金額": "total_amount_claimed",
    "費用明細": "itemized_breakdown",
    "收據連結": "receipt_urls",
    "政策確認": "policy_confirmation",
    "審批狀態": "approval_status"
  },
  "approvalStatusColumn": 13
}
```

**規則**：
- **左邊**：Google Sheet 的實際欄位名稱（必須**完全一致**，包括大小寫和空格）
- **右邊**：系統內部名稱（**不要修改**）

---

## 🚀 步驟 4: 測試與驗證（10 分鐘）

### 4.1 等待 Vercel 重新部署

在 Vercel Dashboard → Deployments 頁面：
- 等待狀態變為「**Ready**」（約 1-2 分鐘）

### 4.2 訪問正式網站

Vercel 會提供一個 URL，例如：
```
https://hkit-account.vercel.app
```

或如果有自定義域名：
```
https://expense.hkit.edu.hk
```

### 4.3 測試清單

#### ✅ 基本功能測試

1. **載入申請列表**
   - [ ] 頁面可以正常載入
   - [ ] 顯示公司 Google Sheet 的實際數據
   - [ ] 數量正確（與 Google Sheet 的行數一致）

2. **篩選功能**
   - [ ] 按狀態篩選（全部/待處理/已核准/已拒絕）
   - [ ] 搜尋功能（輸入員工姓名/ID）

3. **查看詳情**
   - [ ] 點擊「查看詳情」可以展開完整資訊
   - [ ] 所有欄位顯示正確

#### ✅ 核心功能測試

4. **核准申請**
   - [ ] 選擇一個待處理的申請
   - [ ] 點擊「核准」按鈕
   - [ ] 確認彈窗出現
   - [ ] 點擊確認
   - [ ] 頁面顯示「已核准」
   - [ ] **重要**：到 Google Sheet 確認「審批狀態」欄位已更新為 `APPROVED`

5. **拒絕申請**
   - [ ] 選擇一個待處理的申請
   - [ ] 點擊「拒絕」按鈕
   - [ ] 填寫拒絕原因（至少 20 字）
   - [ ] 點擊確認
   - [ ] 頁面顯示「已拒絕」
   - [ ] **重要**：到 Google Sheet 確認「審批狀態」欄位已更新為 `REJECTED`

#### ✅ 安全性測試

6. **權限驗證**
   - [ ] Service Account 可以讀取 Google Sheet
   - [ ] Service Account 可以寫入「審批狀態」欄位
   - [ ] 其他人員無法直接訪問 Service Account 金鑰

---

## 🐛 故障排除

### 問題 1: 頁面載入但沒有數據

**可能原因**：
- Service Account 未加入 Google Sheet 共享
- Sheet ID 錯誤

**解決方案**：
1. 確認 Google Sheet 已共享給 Service Account
2. 檢查 `sheet-config.json` 的 `sheetId` 是否正確
3. 在瀏覽器按 F12 打開開發者工具，查看 Console 的錯誤訊息

### 問題 2: 環境變數錯誤

**症狀**：部署成功但出現 "Failed to fetch applications"

**解決方案**：
1. Vercel Dashboard → Settings → Environment Variables
2. 確認兩個環境變數都已設置
3. 確認 `GOOGLE_PRIVATE_KEY` 包含完整的金鑰（包括 BEGIN 和 END）
4. 修改後到 Deployments 頁面點擊「**Redeploy**」

### 問題 3: 無法更新審批狀態

**症狀**：可以看到數據但無法核准/拒絕

**解決方案**：
1. 確認 Service Account 的權限是「**編輯者**」（不是「檢視者」）
2. 確認 `sheet-config.json` 的 `approvalStatusColumn` 正確
3. 確認 Google Sheet 有「審批狀態」欄位

### 問題 4: 欄位顯示 undefined

**原因**：`fieldMapping` 不正確

**解決方案**：
1. 打開 Google Sheet，記下第一行的**確切欄位名稱**（包括空格和大小寫）
2. 更新 `sheet-config.json` 的 `fieldMapping`
3. 提交並推送更改

---

## 📊 切換完成檢查清單

在通知用戶可以使用前，確認：

- [ ] Google Service Account 已建立（使用公司 Google Workspace）
- [ ] Service Account 金鑰已下載並妥善保管
- [ ] Google Sheets API 已啟用
- [ ] 正式 Google Sheet 已共享給 Service Account（編輯者權限）
- [ ] Vercel 環境變數已更新為公司的金鑰
- [ ] `sheet-config.json` 已更新為正式的 Sheet ID
- [ ] 已測試所有核心功能（查看、篩選、核准、拒絕）
- [ ] Google Sheet 的「審批狀態」欄位可以正確更新
- [ ] 正式網站 URL 可以正常訪問
- [ ] 已通知相關人員新的網站 URL

---

## 🔒 安全性注意事項

### ✅ 已實施的安全措施

1. **API 金鑰保護**
   - Service Account 金鑰存放在 Vercel 環境變數（加密）
   - 不會出現在程式碼或 Git 倉庫中

2. **最小權限原則**
   - Service Account 只能訪問被共享的 Google Sheet
   - 無其他 Google Workspace 權限

3. **HTTPS 加密**
   - Vercel 自動提供 HTTPS
   - 所有數據傳輸加密

### 🔐 建議的額外安全措施

1. **啟用 Vercel Authentication**（可選）
   - Vercel Dashboard → Settings → Deployment Protection
   - 啟用「Vercel Authentication」
   - 只有授權的 Vercel 團隊成員可以訪問

2. **IP 白名單**（可選）
   - 如果只有公司內部使用，可以設置 IP 限制
   - 需要 Vercel Pro 方案

3. **定期金鑰輪換**
   - 建議每 6-12 個月更換 Service Account 金鑰
   - 刪除舊的金鑰

4. **審計日誌**
   - Google Cloud Console 可以查看 API 呼叫日誌
   - 監控異常訪問

---

## 📞 技術支援

### 開發者聯絡資訊

- **GitHub Issues**: https://github.com/kmkaiuse-bit/HKIT-Account/issues
- **Email**: [開發者電子郵件]

### 相關文檔

- **完整使用說明**：`README.md`
- **快速部署指南**：`QUICK-DEPLOY.md`
- **切換 Sheet 指南**：`HOW-TO-SWITCH-SHEET.md`

### 外部資源

- **Google Cloud Console**: https://console.cloud.google.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Sheets API 文檔**: https://developers.google.com/sheets/api

---

## ⏱️ 預計時間表

| 步驟 | 負責人 | 預計時間 |
|------|--------|---------|
| 建立 Service Account | 公司 IT | 10 分鐘 |
| 設置 Google Sheet | 公司 IT | 5 分鐘 |
| 更新系統配置 | 開發者/IT | 5 分鐘 |
| 測試與驗證 | 開發者/IT | 10 分鐘 |
| **總計** | | **30 分鐘** |

---

## ✅ 切換完成！

完成所有步驟後，系統即可正式使用！

**正式環境 URL**：[在此填入 Vercel 提供的 URL]

**使用者**：校長或其他授權人員
**功能**：查看費用申請、核准/拒絕

---

**文檔版本**：1.0
**最後更新**：2025-12-16
**維護者**：[開發者名稱]
