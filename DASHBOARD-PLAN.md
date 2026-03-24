# HKIT Dashboard — 設計方案 v1.2

## 現況（已完成）

| 功能 | 狀態 |
|------|------|
| 三角色 Tab（員工 / 會計 / 校長） | ✅ 完成 |
| 員工報銷表格提交 → Google Sheet | ✅ 完成 |
| 動態欄位對應（不依賴欄位順序） | ✅ 完成 |
| 會計報表 + 下載 Excel | ✅ 完成 |
| 校長審批（核准 / 拒絕） | ✅ 完成 |
| Crash bug 修復（payment_total_amount undefined） | ✅ 完成 |
| 換用全新 Google Sheet（欄位完全自定義） | ✅ 完成 |
| Vercel 部署 | ✅ 完成 |
| 校長審批頁內嵌報價單預覽（iframe / img） | ✅ 完成 |

---

## 三個 Tab

| Tab | 使用者 | 功能 |
|-----|--------|------|
| 員工報銷 | 報銷員工 | 填寫報銷表格 + 上傳報價單，提交申請 |
| 會計報表 | 會計同事 | 查看所有記錄、統計數字、下載 Excel |
| 校長審批 | 校長 | 查看待審批申請，逐一核准或拒絕，內嵌預覽報價單 |

---

## Google Sheet 欄位結構（A–N）

| 欄 | 標題 | 內部欄位 |
|----|------|---------|
| A  | Timestamp | timestamp |
| B  | Date | date |
| C  | Staff Name | staff_name |
| D  | Payment Details | payment_details |
| E  | Payment Total Amount | payment_total_amount |
| F  | Remark | remark |
| G  | Centre | centre |
| H  | Programme | programme |
| I  | Term | term |
| J  | EDB Funding | edb_funding |
| K  | Estimated Payment Date | estimated_payment_date |
| L  | Approval Status | approval_status |
| M  | Rejection Reason | rejection_reason |
| N  | Quotation Link | quotation_link |

**Sheet ID：** `1fXv08utbbU929fqviINMhyNOcTZ6_Hz4l2_XTQGiWlk`

---

## ⚠️ 已知問題：報價單直接上傳（Google Drive API）

### 問題根源

普通 Google 帳號的 Service Account **沒有 Drive 儲存空間配額**，無法建立/擁有任何檔案。

錯誤訊息：
```
Service Accounts do not have storage quota. Leverage shared drives,
or use OAuth delegation instead.
```

### 嘗試過的方案

| 方案 | 結果 |
|------|------|
| Service Account 直接上傳（無指定資料夾） | ❌ 失敗：無儲存配額 |
| 指定 Drive 資料夾 + Service Account 設為編輯者 | ❌ 失敗：配額問題與資料夾無關，Service Account 仍無法建立檔案 |
| Shared Drive | ⚠️ 需要 Google Workspace，普通帳號不適用 |
| OAuth delegation | ⚠️ 需要 Google Workspace 管理員權限，普通帳號不適用 |

### 可行解決方案（待決定）

**方案 A：Vercel Blob（推薦）**
- Vercel 原生儲存，與 Next.js 完全整合
- 不依賴 Google 任何 API
- 操作：Vercel Dashboard → Storage → Create Blob → 自動注入 `BLOB_READ_WRITE_TOKEN`
- 改動：安裝 `@vercel/blob`，修改 `uploadFileToDrive` 改用 `put()`
- 費用：免費 tier 500MB

**方案 B：換用學校 Google Workspace 帳號**
- 在 Workspace 建立 Service Account + 開啟 domain-wide delegation
- 現有 code 基本不需改動
- 需要學校 IT 配合

**方案 C：維持現狀（員工手動貼連結）**
- 員工自行上傳到 Google Drive，複製分享連結貼入表格
- 無需任何 API 改動，但操作多幾步

### 現時 code 狀態

目前 `app/page.tsx` 保留**檔案上傳 UI**，`app/api/submit/route.ts` 嘗試上傳 Drive：
- 上傳失敗時申請仍然提交成功
- 錯誤訊息會顯示給用戶（不再靜默失敗）
- `sheet-config.json` 的 `driveFolderId` 已填入（但因配額問題暫無效果）

---

## 換帳號 / 換學校 Drive 和 Sheet

### 換 Google Sheet
改 `sheet-config.json` 的 `sheetId`，或在 Vercel 設 `GOOGLE_SHEET_ID` env var。

### 換到學校 Google Workspace
只需在 Vercel Dashboard 更新兩個 env vars — **程式碼不需改動：**
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` → 學校 Service Account email
- `GOOGLE_PRIVATE_KEY` → 學校 Service Account 私鑰

換到 Workspace 後 Drive 上傳亦可恢復正常（Service Account 有配額或可用 delegation）。

---

## v1.x 範圍限制（留待後續版本）

- 無登入/身份驗證（員工靠自填姓名識別）
- 報價單上傳受制於 Google 帳號類型（普通帳號暫無法用 Drive API）
- 不支援編輯已提交的申請
- 不支援批量審批
- 無電郵通知功能

---

## 驗收標準

- 員工報銷：填寫表格 → 提交成功 → Sheet 出現新行，每欄資料正確
- 會計報表：統計數字正確；「下載 Excel」下載有中文標題的 `.xlsx`（含報價單連結欄）
- 校長審批：預設只顯示待審批；核准/拒絕正確更新 Sheet；點「查看詳情」出現報價單內嵌預覽
- 換 Sheet ID 或 Service Account 後，程式碼不需改動
