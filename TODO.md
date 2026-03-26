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

## Feature 8: Google Drive Storage (Personal Account)
No code changes. Config only:
- [ ] Create quotation folder in personal Google Drive
- [ ] Share folder with service account email (Editor)
- [ ] Copy folder ID → set `GOOGLE_DRIVE_FOLDER_ID` in `.env.local`

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
