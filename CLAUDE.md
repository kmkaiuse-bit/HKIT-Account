# HKIT 付款申請系統 — Claude Code Guide

## Project Overview
Next.js 14 (App Router) payment request management system for HKIT.
- **Database:** Google Sheets (via googleapis service account)
- **File storage:** Google Drive (personal account via OAuth2 token)
- **AI scan:** OpenRouter API (`google/gemini-2.0-flash-001`)
- **Deploy:** Vercel

---

## Architecture

```
app/
  page.tsx                  — Single-page app (all 3 tabs: Staff, Accounting, Principal)
  api/
    applications/route.ts   — GET all applications from sheet
    submit/route.ts         — POST new application (multi-file, claimants JSON)
    scan-quotation/route.ts — POST file → OpenRouter vision → JSON extraction
    update-amount/route.ts  — PATCH amount for a row
    verify-pin/route.ts     — POST PIN check (server-side only)
    export/route.ts         — GET Excel download

lib/
  google-sheets.ts          — All Google Sheets + Drive operations
  constants.ts              — LABELS (zh/en), dropdown options

sheet-config.json           — Column header ↔ field name mapping + config
```

---

## Key Conventions

### Google Sheet column mapping
`sheet-config.json` drives all column ordering. `appendApplication()` and `getAllApplications()` use header names dynamically — never hardcode column indices. When adding a new field:
1. Add the column header to the Google Sheet manually
2. Add `"Header Name": "field_name"` to `fieldMapping` in `sheet-config.json`
3. Add `field_name: string` to `Application` interface in `lib/google-sheets.ts`
4. Add to `Application` interface in `app/page.tsx`

### Language toggle
All UI strings live in `LABELS` in `lib/constants.ts`. Access via `const L = LABELS[lang]` then `L.keyName`. Add new strings to **both** `zh` and `en` objects — TypeScript will catch missing keys.

### Claimants
Stored as JSON string in the `Claimants` sheet column. Format: `[{name, amount, description}, ...]`. `payment_details` is auto-generated as a human-readable summary. `payment_total_amount` is the sum of claimant amounts.

### File uploads
Up to 5 files per submission. Files sent as `quotation_0` … `quotation_4` in FormData. Links stored comma-separated in `quotation_link` column. Split with `link.split(', ')` when rendering.

### Drive uploads
`getDriveClientForUpload()` in `lib/google-sheets.ts`:
- Uses OAuth2 user token (`GOOGLE_USER_REFRESH_TOKEN`) when set → files owned by personal account
- Falls back to service account when token not set → for Workspace Shared Drive migration

### PIN auth
PINs are server-side only (`STAFF_PIN`, `ACCOUNTING_PIN`, `PRINCIPAL_PIN` env vars). Client sends role + PIN to `/api/verify-pin`, gets `{ ok: boolean }`. Unlocked roles stored in `sessionStorage`.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `GOOGLE_SHEET_ID` | Target spreadsheet ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account for Sheets access |
| `GOOGLE_PRIVATE_KEY` | Service account private key (newlines as `\n`) |
| `GOOGLE_DRIVE_FOLDER_ID` | Drive folder for quotation uploads |
| `GOOGLE_OAUTH_CLIENT_ID` | OAuth client for personal Drive upload |
| `GOOGLE_OAUTH_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_USER_REFRESH_TOKEN` | Personal account refresh token |
| `OPENROUTER_API_KEY` | AI scan via OpenRouter |
| `STAFF_PIN` | PIN for Staff tab (leave empty = no PIN) |
| `ACCOUNTING_PIN` | PIN for Accounting tab |
| `PRINCIPAL_PIN` | PIN for Principal tab |

---

## Development

```bash
npm run dev     # local dev server
npm run build   # ALWAYS run before git push to catch TypeScript errors
```

**Rule: Always `npm run build` locally before pushing.** Vercel TypeScript errors are slow to debug.

---

## Common Pitfalls

- **`Set` iteration in strict TS:** Use `Array.from(set)` not `[...set]`
- **`as const` on LABELS:** Don't use it — creates incompatible literal union types between zh/en
- **Service account Drive quota:** Service accounts have zero quota on personal Google accounts. Always use `getDriveClientForUpload()` (OAuth2) not `getGoogleDriveClient()` for uploads
- **Adding sheet columns:** Always add the header to the actual Google Sheet first, then update `sheet-config.json`. The dynamic mapping handles column order automatically.

---

## Admin Dashboard Plan

### Goal
Add a private admin dashboard at `/admin` (direct URL only — no link in the main app). Protected by `ADMIN_PIN` env var. Displays activity logs stored in a "Logs" tab of the existing Google Spreadsheet.

### New Routes & Files
```
app/
  admin/
    page.tsx                    — Admin dashboard UI ('use client')
  api/
    admin/
      verify/route.ts           — POST admin PIN verification
      logs/route.ts             — GET paginated logs (requires x-admin-pin header)
```

### Log Schema (Logs Sheet — 8 columns)
| Col | Header | Description |
|-----|--------|-------------|
| A | Timestamp | HKT datetime string |
| B | Event Type | Enum value (see below) |
| C | Actor | `staff` / `accounting` / `principal` / `system` / `admin` |
| D | Record No | Application record number if applicable |
| E | Details | Human-readable summary |
| F | Status | `SUCCESS` or `FAILURE` |
| G | IP Address | `x-forwarded-for` first IP |
| H | Extra | JSON string for overflow data |

Event types: `APPLICATION_SUBMITTED`, `APPLICATION_APPROVED`, `APPLICATION_REJECTED`, `AMOUNT_UPDATED`, `PIN_VERIFIED`, `PIN_FAILED`, `AI_SCAN_SUCCESS`, `AI_SCAN_FAILURE`, `API_ERROR`, `ADMIN_LOGIN_SUCCESS`, `ADMIN_LOGIN_FAILURE`

### Changes to `lib/google-sheets.ts`
1. Add `LogEntry` interface and `EVENT_TYPES` const array after `Application` interface
2. Add module-level `let logsSheetReady = false` cache flag
3. Add private `ensureLogsSheet()` — auto-creates "Logs" tab + headers on first call
4. Add `export async function appendLog(entry: Omit<LogEntry, 'timestamp'>): Promise<void>` — **never throws**, wraps everything in try/catch
5. Add `export async function getLogs(options): Promise<{ logs: LogEntry[]; total: number }>` — fetches, filters, reverses (newest first), paginates
6. Change `appendApplication()` return type from `Promise<void>` to `Promise<string>` (returns the generated `recordNo`)

### Changes to Existing API Routes
Add `appendLog(...)` calls **after** primary operations:
- `app/api/submit/route.ts` → `APPLICATION_SUBMITTED` (use returned `recordNo`)
- `app/api/update-status/route.ts` → `APPLICATION_APPROVED` or `APPLICATION_REJECTED`
- `app/api/verify-pin/route.ts` → `PIN_VERIFIED` or `PIN_FAILED` (no-PIN path: log with `extra: 'no-pin-required'`)
- `app/api/update-amount/route.ts` → `AMOUNT_UPDATED`
- `app/api/scan-quotation/route.ts` → `AI_SCAN_SUCCESS` or `AI_SCAN_FAILURE`

### `app/api/admin/verify/route.ts`
- POST `{ pin }` — validates against `ADMIN_PIN` env var
- Returns `403` if `ADMIN_PIN` is not set (no fallback — intentional; unlike role PINs)
- Calls `appendLog` for success/failure

### `app/api/admin/logs/route.ts`
- GET with `x-admin-pin` header (re-validated on every request)
- Query params: `page`, `pageSize`, `eventType`, `startDate`, `endDate`
- `export const dynamic = 'force-dynamic'`

### `app/admin/page.tsx` Structure
- **Login view**: full-page centered card, password input, `POST /api/admin/verify`
- On success: store PIN in React state only (never localStorage/sessionStorage)
- **Dashboard view**: filter bar (event type, date range), stats row, paginated log table, auto-refresh toggle (30s interval)
- Each request to `/api/admin/logs` sends `x-admin-pin` header from state

### New Environment Variable
```
# Admin dashboard PIN (no fallback — must be set to enable admin access)
ADMIN_PIN=
```
Add to `.env.example` after `PRINCIPAL_PIN`.

### Security Rules
- `ADMIN_PIN` unset → always deny (unlike role PINs)
- Admin PIN lives in React state only — cleared on reload/logout
- No link to `/admin` anywhere in the main app — URL only
- "Logs" sheet tab can be hidden in Google Sheets UI to prevent accidental viewing

### Implementation Order
1. `lib/google-sheets.ts` (data layer — safe to deploy without UI)
2. `app/api/admin/verify/route.ts` + `app/api/admin/logs/route.ts`
3. Instrument existing routes with `appendLog` calls
4. `app/admin/page.tsx`
5. Add `ADMIN_PIN` to `.env.example`
6. `npm run build` to verify TypeScript, then test end-to-end
