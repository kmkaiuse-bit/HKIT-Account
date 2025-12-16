# 🚀 部署到 Vercel 指南

## 📋 部署前準備

確保你已經完成：
- ✅ Google Service Account 金鑰已取得
- ✅ Google Sheet 已共享給 Service Account
- ✅ 本地測試成功（`npm run dev` 可以正常運行）

---

## 步驟 1: 推送到 GitHub

### 1.1 創建 GitHub 倉庫

1. 前往 [GitHub](https://github.com/)
2. 點擊右上角「+」→「New repository」
3. 填寫：
   - Repository name: `expense-claim-dashboard`
   - Description: `Expense Claim Approval Dashboard`
   - 選擇 **Public** 或 **Private**
4. **不要**勾選「Add a README file」（我們已經有了）
5. 點擊「Create repository」

### 1.2 推送代碼

GitHub 會顯示指令，照著執行：

```bash
cd "C:\Users\kmksy\Downloads\ai-bmt-projects\account UI"

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Expense Claim Dashboard"

# 添加遠端倉庫（替換成你的 GitHub username）
git remote add origin https://github.com/YOUR_USERNAME/expense-claim-dashboard.git

# 推送
git branch -M main
git push -u origin main
```

**重要**：替換 `YOUR_USERNAME` 為你的 GitHub 使用者名稱！

---

## 步驟 2: 連接 Vercel

### 2.1 登入 Vercel

1. 前往 [Vercel](https://vercel.com/)
2. 點擊「Sign Up」或「Log In」
3. 選擇「Continue with GitHub」

### 2.2 導入專案

1. 在 Vercel Dashboard，點擊「Add New」→「Project」
2. 在列表中找到 `expense-claim-dashboard`
3. 點擊「Import」

### 2.3 配置專案

**Framework Preset**: 自動偵測為 `Next.js` ✅

**Root Directory**: 保持預設（`.`）✅

**Build and Output Settings**: 保持預設 ✅

點擊「Deploy」**之前**，先設置環境變數！

---

## 步驟 3: 設置環境變數

### 3.1 展開「Environment Variables」區塊

在 Vercel 部署頁面，找到「Environment Variables」區塊。

### 3.2 添加變數

添加以下 2 個環境變數：

#### 變數 1: `GOOGLE_SERVICE_ACCOUNT_EMAIL`

- **Name**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **Value**: 你的 Service Account 電子郵件
  ```
  expense-claim-service@project-123456.iam.gserviceaccount.com
  ```
- **Environment**: 全部勾選（Production, Preview, Development）

#### 變數 2: `GOOGLE_PRIVATE_KEY`

- **Name**: `GOOGLE_PRIVATE_KEY`
- **Value**: 你的私鑰（從 JSON 文件複製）
  ```
  -----BEGIN PRIVATE KEY-----
  MIIEvQIBADANBgkqhkiG9w0BA...
  -----END PRIVATE KEY-----
  ```
- **Environment**: 全部勾選（Production, Preview, Development）

**重要提示**：
- 私鑰要包含 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`
- 保留所有的 `\n` 換行符號
- 用雙引號包起來

### 3.3 完成部署

點擊「Deploy」按鈕！

---

## 步驟 4: 等待部署

部署過程約 1-3 分鐘：

```
1. Building...       ⏳ 安裝依賴和構建
2. Deploying...      ⏳ 上傳到 CDN
3. Ready!            ✅ 完成
```

完成後，Vercel 會提供一個 URL，例如：
```
https://expense-claim-dashboard.vercel.app
```

---

## 步驟 5: 測試部署

### 5.1 訪問網站

點擊 Vercel 提供的 URL。

### 5.2 檢查功能

- ✅ 頁面可以正常載入
- ✅ 顯示申請列表
- ✅ 篩選功能正常
- ✅ 可以核准/拒絕申請

---

## 🔧 常見問題

### 問題 1: 部署失敗 - "Error: Cannot find module..."

**原因**: 依賴未正確安裝

**解決方案**:
```bash
# 確保 package.json 正確
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

Vercel 會自動重新部署。

### 問題 2: 環境變數錯誤

**症狀**: 頁面載入但沒有數據

**解決方案**:
1. 在 Vercel Dashboard → 你的專案 → Settings → Environment Variables
2. 檢查變數是否正確設置
3. 確認 `GOOGLE_PRIVATE_KEY` 包含完整的金鑰
4. 修改後，點擊「Redeploy」重新部署

### 問題 3: "Failed to fetch applications"

**原因**: Google Sheet 權限問題

**解決方案**:
1. 打開 Google Sheet
2. 確認 Service Account 電子郵件已加入共享
3. 權限為「編輯者」

### 問題 4: 無法更新審批狀態

**原因**: Service Account 權限不足

**解決方案**:
- 確認共享權限為「編輯者」（不是「檢視者」）

---

## 🔄 更新部署

當你修改代碼後：

```bash
# 提交更改
git add .
git commit -m "Update: description of changes"
git push
```

Vercel 會自動偵測並重新部署！

---

## 🌐 自定義域名（選填）

### 在 Vercel 添加自定義域名

1. Vercel Dashboard → 你的專案 → Settings → Domains
2. 輸入你的域名（例如：`expense.yourdomain.com`）
3. 按照 Vercel 的指示更新 DNS 設定

---

## 🔐 安全性建議

### 1. 使用環境變數

✅ 已完成 - 所有敏感資訊都在環境變數中

### 2. 限制 Service Account 權限

- 只共享必要的 Google Sheet
- 定期檢查共享清單

### 3. 啟用 Vercel Authentication（選填）

如果需要保護頁面：

1. Vercel Dashboard → Settings → Deployment Protection
2. 啟用「Vercel Authentication」
3. 只有 Vercel 團隊成員可以訪問

---

## 📊 監控部署狀態

### Vercel Dashboard

在 Vercel Dashboard 可以查看：
- 部署歷史
- 錯誤日誌
- 性能分析
- 使用量統計

### 實時日誌

點擊部署 → 「View Function Logs」可以查看實時日誌。

---

## 🎉 完成！

你的申請審批系統現在已經上線了！

**部署 URL**: `https://your-project.vercel.app`

### 分享給校長

將 URL 分享給需要使用的人：
- 他們可以直接在瀏覽器訪問
- 不需要安裝任何軟體
- 手機、平板、電腦都可以使用

---

## 📱 下一步（選填）

### 添加到主屏幕（PWA）

用戶可以在手機瀏覽器中：
1. 訪問網站
2. 點擊「添加到主屏幕」
3. 像使用 App 一樣使用

### 自動化部署

設置完成後：
- 每次推送到 GitHub → 自動部署
- Preview 分支 → 預覽環境
- Main 分支 → 正式環境

---

**需要幫助？**
查看 [Vercel 文檔](https://vercel.com/docs) 或在 GitHub Issues 提問。
