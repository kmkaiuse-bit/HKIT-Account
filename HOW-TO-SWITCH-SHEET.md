# 🔄 如何切換到另一個 Google Sheet

**這是系統的核心設計特色！** 只需 3 個步驟即可切換。

---

## 方法 1：修改配置文件（推薦 ⭐）

### 步驟 1：取得新 Sheet 的 ID

從 Google Sheets URL 複製：
```
https://docs.google.com/spreadsheets/d/ABCDEFG123456789/edit
                                        ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                        這就是 Sheet ID
```

### 步驟 2：編輯配置文件

打開 `sheet-config.json`，修改 `sheetId`：

```json
{
  "sheetId": "ABCDEFG123456789",  ← 改成新的 Sheet ID
  "sheetName": "Form Responses 1",
  ...
}
```

### 步驟 3：共享新 Sheet 給 Service Account

1. 打開新的 Google Sheet
2. 點擊「共用」
3. 貼上你的 Service Account 電子郵件（在 `.env` 中）
4. 權限設為「編輯者」

### 步驟 4：重新載入頁面

在瀏覽器中按 `F5` 重新整理，完成！

---

## 方法 2：使用環境變數覆蓋

如果你不想修改 `sheet-config.json`，可以在 `.env` 中添加：

```env
GOOGLE_SHEET_ID=ABCDEFG123456789
```

這會覆蓋配置文件中的設定。

---

## 🔍 如果新 Sheet 欄位不同怎麼辦？

### 情況 1：欄位名稱完全一樣

不需要做任何修改，直接切換即可！

### 情況 2：欄位名稱不同

需要更新 `sheet-config.json` 中的 `fieldMapping`。

#### 範例：

**原始 Sheet 欄位**：
- `Employee Full Name`
- `Total Amount Claimed`

**新 Sheet 欄位**：
- `姓名`
- `申請金額`

**更新 fieldMapping**：

```json
{
  "fieldMapping": {
    "姓名": "employee_full_name",
    "申請金額": "total_amount_claimed",
    ...
  }
}
```

**規則**：
- **左邊**：Google Sheet 中的**實際欄位名稱**
- **右邊**：系統內部使用的欄位名稱（不要改）

---

## 📋 完整的 fieldMapping 範例

如果你的 Sheet 使用繁體中文欄位：

```json
{
  "sheetId": "你的新SheetID",
  "sheetName": "工作表1",
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
    "收據": "receipt_urls",
    "確認聲明": "policy_confirmation",
    "審批狀態": "approval_status"
  },
  "approvalStatusColumn": 13
}
```

**重要**：`approvalStatusColumn` 是「審批狀態」欄位的位置（從 1 開始計數）。

---

## 🎯 快速檢查清單

在切換到新 Sheet 前，確認：

- [ ] 新 Sheet 的 Service Account 已加入共享（編輯者權限）
- [ ] `sheetId` 已更新
- [ ] `sheetName` 與工作表名稱一致
- [ ] 如果欄位名稱不同，已更新 `fieldMapping`
- [ ] `approvalStatusColumn` 正確（審批狀態欄位的位置）

---

## 🧪 測試新 Sheet 是否連接成功

### 方法 1：瀏覽器測試

訪問：`http://localhost:3000/api/applications`

如果看到 JSON 數據，表示成功！

### 方法 2：頁面測試

訪問：`http://localhost:3000`

如果顯示申請列表，表示成功！

---

## ❌ 常見問題

### 問題 1：頁面一直載入中

**可能原因**：
- Service Account 未加入新 Sheet
- Sheet ID 錯誤
- Sheet 名稱錯誤

**解決方案**：
打開瀏覽器開發者工具（F12），查看 Console 的錯誤訊息。

### 問題 2：欄位顯示 undefined

**原因**：`fieldMapping` 不正確

**解決方案**：
1. 打開新 Sheet，記下第一行的**確切欄位名稱**（包括空格）
2. 更新 `sheet-config.json` 中的 `fieldMapping`

### 問題 3：無法更新審批狀態

**原因**：`approvalStatusColumn` 不正確

**解決方案**：
數一下「審批狀態」是第幾欄（從左邊第 1 欄開始），更新 `approvalStatusColumn`。

---

## 💡 專業提示

### 提示 1：管理多個 Sheet 配置

創建多個配置文件：

```
sheet-config.json          ← 預設配置
sheet-config-team-a.json   ← A 團隊的 Sheet
sheet-config-team-b.json   ← B 團隊的 Sheet
```

需要切換時，只需複製對應的配置：
```bash
copy sheet-config-team-a.json sheet-config.json
```

### 提示 2：版本控制

如果多人協作，建議：
- 將 `sheet-config.json` 提交到 Git
- 使用 `.env` 的 `GOOGLE_SHEET_ID` 進行個人覆蓋

### 提示 3：自動化切換

可以創建批次檔案快速切換：

**switch-to-team-a.bat**:
```bat
copy sheet-config-team-a.json sheet-config.json
echo 已切換到 Team A 的 Sheet
npm run dev
```

---

## 🎉 完成！

現在你已經知道如何輕鬆切換不同的 Google Sheets 了！

**記住核心概念**：
1. 修改 `sheetId`
2. 確保 Service Account 有權限
3. 如果欄位不同，更新 `fieldMapping`

就這麼簡單！
