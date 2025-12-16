# ⚡ 快速部署指令（複製貼上即可）

## 📋 前提條件

確保已完成：
- ✅ 在 GitHub 創建了新倉庫
- ✅ 有 Google Service Account 金鑰

---

## 🚀 步驟 1: 推送到 GitHub

### 1.1 創建 GitHub 倉庫

前往：https://github.com/new

填寫：
- Repository name: `expense-claim-dashboard`
- 選擇 Public 或 Private
- **不要**勾選任何選項
- 點擊「Create repository」

### 1.2 複製這些指令（替換 YOUR_USERNAME）

```bash
# 進入專案目錄
cd "C:\Users\kmksy\Downloads\ai-bmt-projects\account UI"

# 添加遠端倉庫（替換成你的 GitHub username）
git remote add origin https://github.com/YOUR_USERNAME/expense-claim-dashboard.git

# 推送
git branch -M main
git push -u origin main
```

**重要**：將 `YOUR_USERNAME` 替換成你的 GitHub 使用者名稱！

**範例**：
```bash
git remote add origin https://github.com/john123/expense-claim-dashboard.git
```

---

## 🌐 步驟 2: 部署到 Vercel

### 2.1 登入 Vercel

1. 前往：https://vercel.com/login
2. 選擇「Continue with GitHub」
3. 授權 Vercel 訪問你的 GitHub

### 2.2 導入專案

1. Vercel Dashboard → 「Add New」 → 「Project」
2. 找到 `expense-claim-dashboard` → 點擊「Import」
3. **不要**馬上點擊 Deploy！

### 2.3 設置環境變數

在「Environment Variables」區塊添加：

#### 變數 1
- **Name**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **Value**: `your-service-account@project.iam.gserviceaccount.com`
- 全部勾選（Production, Preview, Development）

#### 變數 2
- **Name**: `GOOGLE_PRIVATE_KEY`
- **Value**: 從你的 JSON 金鑰文件複製 `private_key` 的值
- 全部勾選（Production, Preview, Development）

**金鑰格式範例**：
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAAS...
...很長的一串...
...
-----END PRIVATE KEY-----
```

### 2.4 點擊 Deploy

等待 1-3 分鐘，完成！

---

## ✅ 驗證部署

Vercel 會給你一個 URL，例如：
```
https://expense-claim-dashboard.vercel.app
```

訪問這個 URL，應該看到：
- ✅ 申請列表頁面
- ✅ 顯示你的 Google Sheet 數據
- ✅ 可以篩選和搜尋
- ✅ 可以核准/拒絕申請

---

## 🔧 如果部署失敗

### 檢查環境變數

1. Vercel Dashboard → 你的專案 → Settings → Environment Variables
2. 確認兩個變數都已設置
3. `GOOGLE_PRIVATE_KEY` 必須包含完整的金鑰（包括 BEGIN 和 END）

### 檢查 Google Sheet 權限

1. 打開 Google Sheet
2. 點擊「共用」
3. 確認 Service Account 電子郵件已加入
4. 權限為「編輯者」

### 重新部署

修改環境變數後：
1. Vercel Dashboard → Deployments
2. 點擊最新的部署 → 「Redeploy」

---

## 🎉 完成！

你的系統現已上線！

**接下來可以做的事**：
- 📱 將 URL 分享給校長
- 🔒 在 Vercel 設置訪問保護（Settings → Deployment Protection）
- 🌐 綁定自定義域名（Settings → Domains）

---

## 📞 需要幫助？

查看完整指南：
- `DEPLOY-TO-VERCEL.md` - 詳細部署說明
- `README.md` - 使用說明
- `HOW-TO-SWITCH-SHEET.md` - 如何切換 Sheet
