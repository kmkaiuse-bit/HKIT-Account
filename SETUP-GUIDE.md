# 🚀 快速設置指南（5 分鐘完成）

## 步驟 1: 取得 Google API 金鑰（2 分鐘）

### 1.1 前往 Google Cloud Console
打開: https://console.cloud.google.com/

### 1.2 創建專案
1. 點擊頂部的專案選擇器
2. 點擊「新增專案」
3. 輸入專案名稱：`expense-claim-system`
4. 點擊「創建」

### 1.3 啟用 API
1. 左側選單 → 「API 和服務」 → 「程式庫」
2. 搜尋 `Google Sheets API`
3. 點擊並啟用

### 1.4 創建服務帳戶
1. 左側選單 → 「API 和服務」 → 「憑證」
2. 點擊「創建憑證」 → 「服務帳戶」
3. 填寫名稱：`expense-claim-service`
4. 點擊「創建並繼續」
5. 角色選擇：跳過（留空）
6. 點擊「完成」

### 1.5 下載金鑰
1. 點擊剛創建的服務帳戶
2. 進入「金鑰」頁籤
3. 點擊「新增金鑰」 → 「JSON」
4. 會自動下載 JSON 文件

---

## 步驟 2: 共享 Google Sheet（30 秒）

1. 打開 JSON 文件，找到 `client_email` 欄位
   ```json
   "client_email": "expense-claim-service@xxx.iam.gserviceaccount.com"
   ```
2. 複製這個電子郵件地址
3. 打開你的 Google Sheet
4. 點擊右上角「共用」按鈕
5. 貼上電子郵件地址
6. 權限選擇「編輯者」
7. **取消勾選「通知使用者」**（因為這是機器人帳號）
8. 點擊「傳送」

---

## 步驟 3: 配置專案（1 分鐘）

### 3.1 創建 .env 文件

在專案根目錄創建 `.env` 文件：

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### 3.2 填入金鑰

打開下載的 JSON 文件，複製以下內容到 `.env`：

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=<JSON 中的 client_email>
GOOGLE_PRIVATE_KEY="<JSON 中的 private_key>"
```

**重要**：`private_key` 要保持原樣（包括 `\n`），並用雙引號包起來。

**範例**：
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=expense-claim-service@project-123456.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BA...(很長的字串)...==\n-----END PRIVATE KEY-----\n"
```

### 3.3 配置 Sheet ID

打開 `sheet-config.json`，修改 `sheetId`：

從你的 Google Sheet URL 複製 ID：
```
https://docs.google.com/spreadsheets/d/1yB0O7Kdx9y3V6LCZ4PuGuekJiZviYgj9JP2Fe-FT0kY/edit
                                        ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                        這就是 Sheet ID
```

貼到 `sheet-config.json`：
```json
{
  "sheetId": "1yB0O7Kdx9y3V6LCZ4PuGuekJiZviYgj9JP2Fe-FT0kY",
  "sheetName": "Form Responses 1",
  ...
}
```

---

## 步驟 4: 啟動專案（30 秒）

```bash
# 安裝依賴（如果還沒裝）
npm install

# 啟動開發伺服器
npm run dev
```

打開瀏覽器：`http://localhost:3000`

---

## ✅ 驗證是否成功

你應該看到：
- ✅ 申請列表載入完成
- ✅ 顯示你的 Google Sheet 中的數據
- ✅ 可以篩選和搜尋
- ✅ 可以核准/拒絕申請

---

## 🔄 切換到另一個 Sheet

只需修改 `sheet-config.json` 中的 `sheetId`，然後重新載入頁面！

---

## ❌ 常見問題

### 1. 頁面一直載入中

**檢查項目**：
- [ ] `.env` 文件是否存在且正確
- [ ] Service Account 是否已加入 Sheet 共享
- [ ] Sheet ID 是否正確

**測試方法**：
打開瀏覽器開發者工具（F12），查看 Console 是否有錯誤訊息。

### 2. 錯誤：Authentication failed

**原因**：Google API 金鑰不正確

**解決方案**：
- 確認 `.env` 中的 `GOOGLE_PRIVATE_KEY` 包含完整的金鑰
- 確認 `GOOGLE_SERVICE_ACCOUNT_EMAIL` 正確

### 3. 錯誤：Unable to parse range

**原因**：Sheet 名稱不正確

**解決方案**：
- 打開 Google Sheet，確認工作表名稱
- 更新 `sheet-config.json` 中的 `sheetName`

---

## 💡 專業提示

### 提示 1：測試 API 連接

打開瀏覽器訪問：
```
http://localhost:3000/api/applications
```

如果看到 JSON 數據，表示 API 正常工作！

### 提示 2：查看即時日誌

在終端運行 `npm run dev` 時，所有 API 請求和錯誤都會顯示在終端。

### 提示 3：重新整理數據

點擊頁面上的「🔄 重新整理」按鈕，可以從 Google Sheets 取得最新數據。

---

## 🎉 完成！

現在你的申請審批系統已經可以使用了！

**下一步**：
- 試試核准一個申請
- 到 Google Sheet 確認狀態已更新
- 嘗試切換到另一個 Sheet（修改 `sheet-config.json`）
