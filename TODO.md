# HKIT 付款申請系統 — Development Task List

## Google Sheet Manual Setup (do this FIRST before running the app)

- [ ] Insert new column A in Google Sheet → set header = `Record No.`
- [ ] Add headers at end of row 1: `Supplier Name`, `Bank Name`, `Bank Account Number`
- [ ] Share your personal Google Drive quotation folder with the service account email (Editor access)
- [ ] Set `GOOGLE_DRIVE_FOLDER_ID` in `.env.local` to that folder's ID

---

## New env vars needed in `.env.local`

```
OPENROUTER_API_KEY=        # for AI scan feature
STAFF_PIN=                 # leave empty = no PIN required for staff tab
ACCOUNTING_PIN=xxxx
PRINCIPAL_PIN=xxxx
```

---

## Step 0: Create `lib/constants.ts` ✅
- [x] LABELS (zh + en) for all UI strings
- [x] CENTRE_OPTIONS (14 options)
- [x] PROGRAMME_OPTIONS (22 options)
- [x] EDB_OPTIONS: ECA, Basic Law, SSE, QESS, SPSS, N/A

---

## Feature 4: HKIT Record Number (HKIT001000…) ✅
- [x] Updated `sheet-config.json` — added `Record No.`, updated `approvalStatusColumn` to 16
- [x] Updated `getAllApplications()` — wider range A:S, maps `record_no`
- [x] Updated `appendApplication()` — counts rows, computes `HKIT` + 6-digit padded number
- [x] Added `record_no` to `Application` interface
- [x] Record No. shown as first column in Accounting tab
- [x] Record No. shown as first column in Excel export

---

## Feature 2: New Fields — Supplier Name, Bank Name, Bank Account Number ✅
- [x] Added to `sheet-config.json` fieldMapping
- [x] Added to `Application` interface in `lib/google-sheets.ts` and `app/page.tsx`
- [x] Added to `emptyForm` state
- [x] Added 3 form fields in Staff tab (Supplier required, Bank optional)
- [x] Extracted and passed in `submit/route.ts`
- [x] Added to Accounting table columns
- [x] Added to Excel export

---

## Feature 3: Multi-Select Dropdowns (Centre, Programme, EDB) ✅
- [x] `MultiSelect` component built in `app/page.tsx`
- [x] Centre → MultiSelect with CENTRE_OPTIONS
- [x] Programme → MultiSelect with PROGRAMME_OPTIONS
- [x] EDB Funding → MultiSelect with EDB_OPTIONS
- [x] Values stored as comma-separated string

---

## Feature 1: Language Toggle (Chinese ↔ English) ✅
- [x] `lang` state with localStorage persistence
- [x] ZH/EN toggle button in header
- [x] All UI strings use `LABELS[lang].xxx`

---

## Feature 6: PIN-Based Access Control ✅
- [x] `app/api/verify-pin/route.ts` created
- [x] `unlockedRoles` state backed by sessionStorage
- [x] PIN modal shown when clicking locked tab
- [x] 🔒 icon on locked tabs
- [x] Staff tab open by default (no PIN if STAFF_PIN not set)

---

## Feature 7: Amount Edit (Accounting Tab) ✅
- [x] `updateAmount()` added to `lib/google-sheets.ts`
- [x] `app/api/update-amount/route.ts` created
- [x] Inline edit in Accounting table (pencil icon on hover, Enter/✓/Escape)

---

## Feature 5: AI Scan for Quotations (Auto-fill) ✅
- [x] `app/api/scan-quotation/route.ts` created (OpenRouter, gemini-2.0-flash-exp)
- [x] File upload triggers scan immediately
- [x] Auto-fills Supplier Name, Amount, Payment Details
- [x] "AI filled — please review" notice shown

---

## Feature 8: Google Drive Storage (Personal Account) ✅

### Current setup (personal Google account)
Files are uploaded using your personal OAuth token so they are owned by your account and count against your personal Drive quota.

**One-time setup (already done):**
- [x] Create quotation folder in personal Google Drive
- [x] Copy folder ID → set `GOOGLE_DRIVE_FOLDER_ID` in Vercel env vars
- [x] Create OAuth client in Google Cloud Console (Web application type)
  - Add `https://developers.google.com/oauthplayground` as authorised redirect URI
- [x] Get refresh token via [OAuth Playground](https://developers.google.com/oauthplayground)
  - Gear icon → Use your own OAuth credentials → paste Client ID & Secret
  - Authorise scope: `https://www.googleapis.com/auth/drive`
  - Exchange code → copy Refresh token
- [x] Set in Vercel env vars:
  - `GOOGLE_OAUTH_CLIENT_ID`
  - `GOOGLE_OAUTH_CLIENT_SECRET`
  - `GOOGLE_USER_REFRESH_TOKEN`
- [x] Code: `getDriveClientForUpload()` in `lib/google-sheets.ts` uses OAuth2 when these vars are present

---

## Future: Migrate to Google Workspace Shared Drive

When the organisation moves to Google Workspace, switch to service account + Shared Drive (no OAuth token needed, no personal quota used).

**Steps:**
1. In Google Workspace, create a **Shared Drive** (Team Drive) and a folder inside it for quotations
2. Share the Shared Drive with the service account email (`GOOGLE_SERVICE_ACCOUNT_EMAIL`) — give it **Content Manager** access
3. Copy the folder ID from the URL → update `GOOGLE_DRIVE_FOLDER_ID` in Vercel env vars
4. **Remove** these 3 env vars from Vercel (the code automatically falls back to service account):
   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`
   - `GOOGLE_USER_REFRESH_TOKEN`
5. Redeploy — no code changes needed

---

## Verification Checklist

- [ ] Add Google Sheet columns (see Manual Setup above)
- [ ] Set env vars (OPENROUTER_API_KEY, PINs)
- [ ] `npm run dev` — all 3 tabs load
- [ ] Toggle ZH/EN — all labels switch
- [ ] Submit form → Record No. auto-generated (HKIT001000…), Supplier/Bank fields saved
- [ ] Upload quotation → AI auto-fills Supplier Name & Amount
- [ ] Click Accounting / Principal tab → PIN modal appears
- [ ] Edit amount in Accounting tab → sheet cell updates
- [ ] Download Excel → Record No. + new fields present
