# HKIT Dashboard — 設計方案 v1.1

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

---

## 三個 Tab

| Tab | 使用者 | 功能 |
|-----|--------|------|
| 員工報銷 | 報銷員工 | 填寫報銷表格 + 貼入報價單連結，提交申請 |
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

## 待做：報價單功能（下一步）

### 問題
現有檔案上傳 → Google Drive API 需額外開啟，否則靜默失敗。

### 解決方案：換成 URL 文字輸入

員工把報價單上傳到自己的 Google Drive，複製分享連結，貼入表格。無需 Drive API。

**員工操作流程：**
1. 上傳檔案到 Google Drive
2. 右鍵 → 「共用」→「知道連結的人可查看」→「複製連結」
3. 貼到表格的「報價單連結」欄位

### 改動檔案

| 檔案 | 改動 |
|------|------|
| `app/page.tsx` | Staff tab：把檔案上傳換成 URL 文字輸入（移除 `quotationFile` / `fileInputRef` state） |
| `app/page.tsx` | Principal tab：加內嵌預覽（展開詳情時顯示 iframe 或圖片） |
| `app/api/submit/route.ts` | 移除 Drive 上傳邏輯，直接讀取 `quotation_link` 欄位值 |

### Staff Tab 改動

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    報價單連結 Quotation URL
    <span className="ml-2 text-xs text-gray-400 font-normal">（可選）</span>
  </label>
  <input
    type="url"
    value={form.quotation_link}
    onChange={e => setForm(f => ({ ...f, quotation_link: e.target.value }))}
    placeholder="貼上 Google Drive 分享連結..."
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <p className="mt-1 text-xs text-gray-400">
    將檔案上傳至 Google Drive → 右鍵「共用」→「複製連結」→ 貼上
  </p>
</div>
```

### submit/route.ts 改動

```ts
// 移除 Drive 上傳，直接讀取連結
const quotation_link = (formData.get('quotation_link') as string || '').trim();
```

### Principal Tab：內嵌預覽

在「查看詳情」展開後，顯示報價單預覽（Google Drive iframe 或圖片）：

```tsx
{app.quotation_link && selectedApp?.rowIndex === app.rowIndex && (
  <div className="mt-4 pt-4 border-t border-gray-100">
    <p className="text-xs text-gray-400 mb-2">報價單預覽</p>
    {isImageUrl(app.quotation_link) ? (
      <img src={app.quotation_link} alt="quotation" className="max-w-full rounded border" />
    ) : (
      <iframe
        src={toEmbedUrl(app.quotation_link)}
        className="w-full h-96 rounded border"
        title="Quotation Preview"
      />
    )}
  </div>
)}
```

Helper functions:
```ts
function toEmbedUrl(url: string): string {
  return url.replace('/view', '/preview').replace('/edit', '/preview');
}
function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
}
```

---

## 換帳號 / 換學校 Drive 和 Sheet

### 換 Google Sheet
改 `sheet-config.json` 的 `sheetId`，或在 Vercel 設 `GOOGLE_SHEET_ID` env var。

### 換到學校 Google Workspace
只需在 Vercel Dashboard 更新兩個 env vars — **程式碼不需改動：**
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` → 學校 Service Account email
- `GOOGLE_PRIVATE_KEY` → 學校 Service Account 私鑰

未來如需 Drive API 上傳，在 `sheet-config.json` 加 `driveFolderId` 指定上傳資料夾。

### 完整換帳號步驟
1. 在學校 Google Cloud 建立 Service Account，下載 JSON
2. 建立新 Google Sheet，加入標題行（A–N），分享給新 Service Account（編輯者）
3. Vercel 更新 `GOOGLE_SERVICE_ACCOUNT_EMAIL` 和 `GOOGLE_PRIVATE_KEY`
4. 更新 `sheet-config.json` 的 `sheetId`
5. Push → Vercel 自動 Redeploy

---

## v1.x 範圍限制（留待後續版本）

- 無登入/身份驗證（員工靠自填姓名識別）
- 報價單為貼連結（非直接上傳）
- 不支援編輯已提交的申請
- 不支援批量審批
- 無電郵通知功能

---

## 驗收標準

- 員工報銷：填寫表格 + 貼報價單連結 → 提交成功 → Sheet 出現新行，每欄資料正確
- 會計報表：統計數字正確；「下載 Excel」下載有中文標題的 `.xlsx`（含報價單連結欄）
- 校長審批：預設只顯示待審批；核准/拒絕正確更新 Sheet；點「查看詳情」出現報價單內嵌預覽
- 換 Sheet ID 或 Service Account 後，程式碼不需改動
