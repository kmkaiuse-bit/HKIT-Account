# HKIT 付款申請系統 — Development Task List

## Google Sheet Manual Setup (do this FIRST before running the app)

- [x] Insert new column A in Google Sheet → set header = `Record No.`
- [x] Add headers at end of row 1: `Supplier Name`, `Bank Name`, `Bank Account Number`
- [ ] Add header: `Claimants` (after `Payment Details` column)
- [x] Share your personal Google Drive quotation folder with the service account email (Editor access)
- [x] Set `GOOGLE_DRIVE_FOLDER_ID` in Vercel env vars

---

## Env vars (Vercel)

```
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_FOLDER_ID=

GOOGLE_OAUTH_CLIENT_ID=         # personal Drive upload (remove when migrating to Workspace)
GOOGLE_OAUTH_CLIENT_SECRET=     # personal Drive upload
GOOGLE_USER_REFRESH_TOKEN=      # personal Drive upload

OPENROUTER_API_KEY=             # AI scan feature
STAFF_PIN=                      # leave empty = no PIN required for staff tab
ACCOUNTING_PIN=xxxx
PRINCIPAL_PIN=xxxx
```

---

## Feature 0: `lib/constants.ts` ✅
- [x] LABELS (zh + en) for all UI strings
- [x] CENTRE_OPTIONS (14 options)
- [x] PROGRAMME_OPTIONS (22 options)
- [x] EDB_OPTIONS: ECA, Basic Law, SSE, QESS, SPSS, N/A

---

## Feature 1: Language Toggle (Chinese ↔ English) ✅
- [x] `lang` state with localStorage persistence
- [x] ZH/EN toggle button in header
- [x] All UI strings use `LABELS[lang].xxx`

---

## Feature 2: New Fields — Supplier Name, Bank Name, Bank Account Number ✅
- [x] Added to `sheet-config.json` fieldMapping
- [x] Added to `Application` interface in `lib/google-sheets.ts` and `app/page.tsx`
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

## Feature 4: HKIT Record Number (HKIT001000…) ✅
- [x] Updated `sheet-config.json` — added `Record No.`, updated `approvalStatusColumn` to 16
- [x] Updated `getAllApplications()` — wider range A:S, maps `record_no`
- [x] Updated `appendApplication()` — counts rows, computes `HKIT` + 6-digit padded number
- [x] Added `record_no` to `Application` interface
- [x] Record No. shown as first column in Accounting tab
- [x] Record No. shown as first column in Excel export

---

## Feature 5: AI Scan for Quotations (Auto-fill) ✅
- [x] `app/api/scan-quotation/route.ts` — OpenRouter, `google/gemini-2.0-flash-001`
- [x] Each uploaded file triggers scan immediately
- [x] First file fills Supplier Name; each file fills next empty claimant row (description + amount)
- [x] "AI auto-filled — please review" notice shown

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

## Feature 8: Google Drive Storage (Personal Account) ✅

Files are uploaded using your personal OAuth token — owned by your account, counts against your 2TB quota.

**One-time setup (done):**
- [x] Create quotation folder in personal Google Drive
- [x] Set `GOOGLE_DRIVE_FOLDER_ID` in Vercel env vars
- [x] Create OAuth client in Google Cloud Console (Web application)
  - Authorised redirect URI: `https://developers.google.com/oauthplayground`
- [x] Get refresh token via [OAuth Playground](https://developers.google.com/oauthplayground)
  - Gear → Use your own OAuth credentials → authorise `https://www.googleapis.com/auth/drive` → copy Refresh token
- [x] Set `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_USER_REFRESH_TOKEN` in Vercel
- [x] `getDriveClientForUpload()` in `lib/google-sheets.ts` uses OAuth2 when vars present

### Future: Migrate to Google Workspace Shared Drive
When moving to Workspace, switch back to service account + Shared Drive (no OAuth needed).

1. Create a **Shared Drive** folder in Google Workspace
2. Share with service account email — give **Content Manager** access
3. Update `GOOGLE_DRIVE_FOLDER_ID` in Vercel
4. Remove `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_USER_REFRESH_TOKEN` from Vercel
5. Redeploy — code auto-falls back to service account, no code changes needed

---

## Feature 9: Claimants Table + Multi-File Upload ✅
- [x] `ClaimantRow` interface `{ name, amount, description }` in `app/page.tsx`
- [x] Replaced standalone Amount + Payment Details fields with dynamic Claimants table
- [x] Total auto-calculates from claimant rows (read-only display)
- [x] `payment_details` auto-generated as summary string for backward compat
- [x] Up to 5 quotation file uploads per submission
- [x] Each file triggers AI scan → fills next empty claimant row
- [x] All files uploaded to Drive; links stored comma-separated in `quotation_link`
- [x] New `Claimants` column in sheet (JSON); added to `sheet-config.json` fieldMapping
- [x] Principal tab: claimants shown as table in expanded view
- [x] Accounting tab: multiple quotation links shown as "View 1", "View 2"...
- [x] Excel export: Claimants column formatted as readable text
- [ ] **Manual step:** Add `Claimants` column header to Google Sheet row 1 (after `Payment Details`)

---

## Bug Fixes ✅
- [x] AI scan overwrites form fields (not preserve user input) — always applies when AI returns value
- [x] Accounting/Principal tabs auto-refresh data when switching tabs
- [x] Quotation preview in Principal tab replaced iframe (blocked by Google X-Frame-Options) with open-in-new-tab link
- [x] Google Drive upload fixed: service account has no quota on personal accounts → switched to OAuth2 user token
- [x] OpenRouter model ID corrected: `google/gemini-2.0-flash-001`
- [x] Google Drive API enabled in Google Cloud project

---

## Verification Checklist

- [x] All 3 tabs load
- [x] Toggle ZH/EN — all labels switch
- [x] Submit form → Record No. auto-generated (HKIT001000…), Supplier/Bank fields saved
- [x] Upload quotation → AI auto-fills Supplier Name + claimant row
- [x] Upload 2 files → 2 claimant rows filled, both links in sheet
- [x] Click Accounting / Principal tab → PIN modal appears
- [x] Switch tabs → data refreshes automatically
- [x] Edit amount in Accounting tab → sheet cell updates
- [x] Download Excel → all columns including Claimants present
- [ ] Add `Claimants` column header to Google Sheet → verify claimants JSON saved on next submission
