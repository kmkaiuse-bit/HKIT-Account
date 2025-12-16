# 🧪 目前的測試環境設置

記錄目前使用個人帳號的測試環境配置。

---

## 📊 目前狀態

- ✅ 使用個人 Google Account
- ✅ 使用測試 Google Sheet
- ✅ 已部署到 Vercel
- ✅ 已推送到 GitHub
- 🔄 準備切換到公司正式環境

---

## 🔑 目前的 Google Service Account

### 測試環境資訊

```
Google Cloud 專案：[你的測試專案名稱]
Service Account Email：[你的 service account email]
測試 Sheet ID：1yB0O7Kdx9y3V6LCZ4PuGuekJiZviYgj9JP2Fe-FT0kY
工作表名稱：Form Responses 1
```

### 金鑰位置

- JSON 金鑰文件：`[存放位置]`
- Vercel 環境變數：已設置

---

## 📝 測試 Google Sheet 結構

目前測試 Sheet 的欄位結構：

```
1.  Timestamp
2.  Employee Full Name
3.  Employee ID
4.  Department/Team
5.  Date of Submission
6.  Purpose of Claim (Brief Description)
7.  Expense Category
8.  Date of Expense
9.  Total Amount Claimed (in local currency)
10. Please provide an itemized breakdown of expenses
11. Upload Receipts/Supporting Documents
12. Policy Confirmation
13. For Office Use Only: Approval Status
```

**審批狀態欄位位置**：第 13 欄

---

## 🌐 部署資訊

### GitHub

- **倉庫**：https://github.com/kmkaiuse-bit/HKIT-Account
- **分支**：main
- **最後提交**：Initial commit with complete dashboard system

### Vercel

- **專案名稱**：hkit-account（或自動生成的名稱）
- **URL**：https://[your-project].vercel.app
- **環境變數**：
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL` ✅
  - `GOOGLE_PRIVATE_KEY` ✅

---

## ✅ 已測試功能

- [x] 從 Google Sheet 讀取數據
- [x] 顯示申請列表
- [x] 狀態篩選（全部/待處理/已核准/已拒絕）
- [x] 搜尋功能（姓名/ID/部門/申請目的）
- [x] 查看申請詳情
- [x] 核准申請
- [x] 拒絕申請（強制填寫原因）
- [x] Google Sheet 狀態同步

---

## 🔄 準備切換到公司環境

### 需要從公司取得

1. **Google Service Account**
   - 公司 Google Workspace 的 Service Account
   - JSON 金鑰文件

2. **正式 Google Sheet**
   - Sheet URL（取得 Sheet ID）
   - 工作表名稱
   - 確認欄位結構

3. **Vercel 存取**
   - 更新環境變數的權限

### 切換步驟

參考以下文檔：
- `COMPANY-SETUP-GUIDE.md` - 給公司 IT 的完整指南
- `SWITCH-CHECKLIST.md` - 快速檢查清單

---

## 📞 聯絡資訊

### 測試環境負責人

- **開發者**：[你的名字]
- **Email**：[你的 Email]
- **測試期間**：2025-12-16 至 正式上線日

### 切換協調

- **公司 IT 聯絡人**：[待填寫]
- **計劃切換日期**：[待確定]

---

## 📚 相關文檔

在專案根目錄：

1. **README.md** - 完整使用說明
2. **SETUP-GUIDE.md** - 5 分鐘快速設置
3. **DEPLOY-TO-VERCEL.md** - Vercel 部署指南
4. **COMPANY-SETUP-GUIDE.md** - 給公司 IT 的設置指南
5. **SWITCH-CHECKLIST.md** - 環境切換檢查清單
6. **HOW-TO-SWITCH-SHEET.md** - 如何切換 Google Sheet

---

## 💡 測試建議

### 在切換前應該測試的情境

- [ ] 大量數據載入（50+ 筆申請）
- [ ] 批量操作（快速核准多個申請）
- [ ] 手機瀏覽器測試
- [ ] 不同狀態的篩選
- [ ] 搜尋功能的各種關鍵字
- [ ] 拒絕原因的字數限制（至少 20 字）
- [ ] Google Sheet 同步延遲測試

### 性能測試

- [ ] 頁面載入速度
- [ ] API 響應時間
- [ ] Google Sheets API 配額使用情況

---

## 🔒 安全性注意

### 測試環境

- ⚠️ 使用測試數據（不包含真實員工資訊）
- ⚠️ JSON 金鑰文件不在 Git 中
- ⚠️ 測試完成後，考慮刪除測試 Service Account

### 正式環境

- ✅ 使用公司的 Google Workspace
- ✅ 金鑰由公司 IT 管理
- ✅ 定期輪換金鑰（建議 6-12 個月）

---

## 📊 測試數據範例

目前測試 Sheet 包含的範例數據類型：

- 員工姓名：John Doe, Jane Smith, Michael Chen
- 部門：IT Department, Marketing, Operations
- 費用類別：Travel, Software, Office Supplies
- 金額範圍：$50 - $1200
- 狀態：PENDING, APPROVED, REJECTED

---

## ✅ 下一步

1. **繼續測試**
   - 確保所有功能正常
   - 發現並修復 bug

2. **準備文檔**
   - 給使用者的操作手冊
   - 給 IT 的技術文檔

3. **協調切換**
   - 聯繫公司 IT
   - 確定切換時間
   - 準備備份計劃

4. **正式上線**
   - 按照 `SWITCH-CHECKLIST.md` 執行
   - 測試驗證
   - 通知使用者

---

**記錄日期**：2025-12-16
**環境狀態**：測試中
**預計正式上線**：[待確定]
