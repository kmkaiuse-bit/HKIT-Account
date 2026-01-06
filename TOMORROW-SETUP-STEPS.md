# 🚀 明天要做的設置步驟

## ✅ 待辦清單

### 第一步：創建 Google Sheet

1. **導入 CSV 模板**
   - 打開 Google Sheets: https://sheets.google.com
   - 點擊「空白」創建新試算表
   - 點擊「檔案」→「匯入」→「上傳」
   - 選擇專案中的 `payment-request-template.csv`
   - 匯入位置選擇「取代試算表」
   - 點擊「匯入資料」

2. **添加審批狀態欄位**
   - 確認 Sheet 有 12 個欄位
   - 第 12 列（L 列）的標題應該是：`For Office Use Only: Approval Status`
   - 如果沒有，手動添加這個標題

3. **複製 Sheet ID**
   - 從瀏覽器網址列複製 Sheet ID
   - 格式：`https://docs.google.com/spreadsheets/d/{這段就是ID}/edit`
   - 例如：`1yB0O7Kdx9y3V6LCZ4PuGuekJiZviYgj9JP2Fe-FT0kY`

---

### 第二步：更新配置文件

4. **更新 sheet-config.json**
   - 打開 `sheet-config.json`
   - 將第 2 行的 `sheetId` 改成你的 Sheet ID
   ```json
   "sheetId": "你的_SHEET_ID_這裡",
   ```

---

### 第三步：設置 Google Cloud Service Account

5. **創建 Google Cloud 專案**
   - 前往: https://console.cloud.google.com/
   - 點擊「創建專案」
   - 輸入專案名稱（例如：HKIT-Payment-System）
   - 點擊「創建」

6. **啟用 Google Sheets API**
   - 在專案中，前往「API 和服務」→「程式庫」
   - 搜尋「Google Sheets API」
   - 點擊「啟用」

7. **創建 Service Account**
   - 前往「API 和服務」→「憑證」
   - 點擊「創建憑證」→「服務帳戶」
   - 填寫服務帳戶名稱（例如：sheet-editor）
   - 點擊「創建並繼續」
   - 跳過權限設定，點擊「完成」

8. **下載 JSON 金鑰**
   - 點擊剛創建的服務帳戶
   - 進入「金鑰」頁籤
   - 點擊「新增金鑰」→「JSON」
   - 下載 JSON 文件（妥善保管！）

9. **記下 Service Account 電子郵件**
   - 格式類似：`sheet-editor@your-project.iam.gserviceaccount.com`
   - 等下會用到

---

### 第四步：配置環境變數

10. **創建 .env 文件**
    ```bash
    cd HKIT-Account
    cp .env.example .env
    ```

11. **編輯 .env 文件**
    打開 `.env`，填入以下資訊（從 JSON 金鑰文件中複製）：

    ```env
    GOOGLE_SERVICE_ACCOUNT_EMAIL=你的服務帳戶@your-project.iam.gserviceaccount.com
    GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n你的私鑰內容\n-----END PRIVATE KEY-----\n"
    ```

    **注意**：
    - `GOOGLE_SERVICE_ACCOUNT_EMAIL` 從 JSON 的 `client_email` 複製
    - `GOOGLE_PRIVATE_KEY` 從 JSON 的 `private_key` 複製（包含雙引號）

---

### 第五步：共享 Google Sheet

12. **給 Service Account 編輯權限**
    - 打開你的 Google Sheet
    - 點擊右上角「共用」
    - 將 Service Account 電子郵件貼上
    - 權限設為「編輯者」
    - 點擊「傳送」

---

### 第六步：安裝與運行

13. **安裝依賴**
    ```bash
    npm install
    ```

14. **運行開發伺服器**
    ```bash
    npm run dev
    ```

15. **打開瀏覽器測試**
    - 前往: http://localhost:3000
    - 應該會看到付款申請列表
    - 測試核准/拒絕功能

---

## 🔍 常見問題排查

### 問題 1：Failed to fetch applications
**原因**：Service Account 沒有權限或 .env 配置錯誤

**解決**：
- 檢查 `.env` 文件是否正確
- 確認 Service Account 已加入 Sheet 共享
- 確認 Google Sheets API 已啟用

### 問題 2：Cannot find module
**原因**：依賴沒有安裝

**解決**：
```bash
npm install
```

### 問題 3：找不到 Sheet 或欄位錯誤
**原因**：Sheet ID 錯誤或欄位名稱不匹配

**解決**：
- 確認 `sheet-config.json` 的 `sheetId` 正確
- 確認 Sheet 第一行的標題與 `fieldMapping` 完全一致

---

## 📝 完成後

系統運行成功後，你可以：
- ✅ 查看所有付款申請
- ✅ 篩選待處理/已核准/已拒絕的申請
- ✅ 搜尋特定申請
- ✅ 核准或拒絕申請
- ✅ 所有操作自動同步到 Google Sheet

---

## 📞 需要幫助？

如果遇到任何問題，檢查：
1. 終端機的錯誤訊息
2. 瀏覽器的 Console（F12 開發者工具）
3. Google Sheet 是否正確更新

祝你明天設置順利！ 🎉
