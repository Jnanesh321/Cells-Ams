# Sprint Progress — VCET AMS

## Overview
- **Goal:** Working usable prototype in 5–6 days
- **Motto:** Prototype > perfection. Stability > feature count.
- **Start:** 2026-05-17

---

## Day 1 — Stabilize + Source Control

### Status: ✅ COMPLETED

| Task | Status | Notes |
|------|--------|-------|
| Verify backend starts | ✅ | Express + Prisma + PostgreSQL runs on port 3000. Health endpoint confirmed working. |
| Verify mobile starts | ✅ | Expo SDK 54, 1390 modules bundled successfully for Android. |
| Verify Android emulator works | ✅ | AVD `Pixel_9` available at `ANDROID_HOME`. `adb` connected. |
| Verify login flows | ✅ | Mock auth works for all roles (Student, Faculty, HOD, Principal, Admin, Parent, Admission). Credentials verified against mock data. |
| Initialize root git | ✅ | Clean repo with proper `.gitignore`. Submodule reference removed. |
| Create stable commit | ✅ | Commit `f910bc8` - all source tracked, `node_modules` and `dist/` properly excluded. |
| Push to GitHub | ⏳ | No remote configured yet. Ready to push when remote is added. |

### Fixes Applied
- **babel.config.js** — Removed `nativewind/babel` plugin (incompatible with NativeWind v4.2.3)
- **LoginScreen.tsx** — Fixed faculty demo credential from `FAC_CSE01` → `FAC_CSE_001`
- **.gitignore** — Added `node_modules`, `dist/`, `.backend.*`, `test-export/`
- **git submodule** — Converted `VCET-AMS-Mobile` from git submodule → tracked directory

### Known Issues
- API baseURL in `src/services/api.ts` points to `http://10.164.180.116:5000` (wrong port, old IP). Currently unused (mock data). Needs update for real backend connection.
- 11 TypeScript implicit-any errors in mobile app (non-blocking for Expo/Babel bundling)
- No GitHub remote configured yet

---

## Day 2 — Core Flow Testing

### Status: ⏳ PENDING

Test and fix Student/Faculty/Admission Cell flows.

---

## Day 3 — VTU Workflow

### Status: ⏳ PENDING

Verify CIE, detention, attendance, timetable logic.

---

## Day 4 — Role + Security

### Status: ⏳ PENDING

Verify ownership checks, permissions, route protection.

---

## Day 5 — UX Polish

### Status: ⏳ PENDING

Loading states, empty states, spacing, keyboard overlap.

---

## Day 6 — Physical Device Test

### Status: ⏳ PENDING

Test on Android phone over WiFi/LAN.

---

## Blocker Log

| ID | Date | Description | Status |
|----|------|-------------|--------|
| B1 | 2026-05-17 | `node_modules` and `dist/` were tracked in initial commit | ✅ Fixed |
| B2 | 2026-05-17 | `nativewind/babel` plugin not found (v4 removed it) | ✅ Fixed |
| B3 | 2026-05-17 | `VCET-AMS-Mobile` was git submodule, not directory | ✅ Fixed |
| B4 | 2026-05-17 | LoginScreen showed wrong faculty ID (`FAC_CSE01` → `FAC_CSE_001`) | ✅ Fixed |
