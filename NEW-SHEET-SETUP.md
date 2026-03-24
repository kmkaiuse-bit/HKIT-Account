# 新 Google Sheet 設定指南

## 第一步：建立新 Google Sheet

1. 前往 [Google Drive](https://drive.google.com)
2. 點擊「新增」→「Google 試算表」
3. 命名為 `HKIT Payment Requests`

---

## 第二步：貼入標題行

打開新 Sheet，點擊 **A1** 格，複製以下整行並貼上（會自動分佈到 A–N 欄）：

```
Timestamp	Date	Staff Name	Payment Details	Payment Total Amount	Remark	Centre	Programme	Term	EDB Funding	Estimated Payment Date	Approval Status	Rejection Reason	Quotation Link
```

> 注意：用 **Tab** 分隔，直接 copy 上面那行貼到 A1 即可。

貼完後欄位應如下：

| 欄 | 標題 |
|----|------|
| A  | Timestamp |
| B  | Date |
| C  | Staff Name |
| D  | Payment Details |
| E  | Payment Total Amount |
| F  | Remark |
| G  | Centre |
| H  | Programme |
| I  | Term |
| J  | EDB Funding |
| K  | Estimated Payment Date |
| L  | Approval Status |
| M  | Rejection Reason |
| N  | Quotation Link |

---

## 第三步：分享給 Service Account

1. 點擊右上角「共用」
2. 加入 Service Account 的 email（格式：`xxx@xxx.iam.gserviceaccount.com`）
3. 權限設為 **「編輯者」**
4. 取消勾選「通知使用者」
5. 點擊「共用」

---

## 第四步：取得 Sheet ID

從瀏覽器 URL 複製 ID：

```
https://docs.google.com/spreadsheets/d/【複製這裡】/edit
```

把 ID 發給我，我會更新程式碼。
