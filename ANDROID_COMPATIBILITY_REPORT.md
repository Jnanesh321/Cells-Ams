# Android Compatibility Report — VCET AMS

**Date:** 2026-05-17
**Target:** Android 10–15 (API 29–35)
**Devices tested for:** Real-world Indian college usage (Vivo, Oppo, Xiaomi, Samsung — 3–4GB RAM, Android 11–14)

---

## Findings Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| CRITICAL | 5 | Must fix before production |
| HIGH     | 12 | Should fix for stable deployment |
| MEDIUM   | 10 | Fix for Indian low-end devices |
| LOW      | 8 | Nice to have |

---

## CRITICAL Issues

### C1. SecureStore — No error handling or fallback
**Files:** `src/store/authStore.ts` (lines 46–68), `App.tsx` (lines 16–21)
**Risk:** On devices without hardware-backed keystore (older Vivo/Oppo, custom ROMs, emulators), `expo-secure-store` throws. Every call is unguarded — no try/catch. If rehydration fails, the splash screen hangs forever.
**Impact:** App crash or infinite splash on affected devices.
**Fix:** Wrap all SecureStore calls in try/catch with AsyncStorage fallback. Add rehydration timeout.

### C2. No rehydration timeout
**Files:** `App.tsx` (lines 16–21)
**Risk:** If SecureStore hangs (slow keystore on low-end devices), `setReady(true)` never fires. User sees spinner indefinitely.
**Impact:** App unusable.
**Fix:** Add `Promise.race()` with a 5s timeout.

### C3. HTTP API URL — cleartext blocked on Android 9+
**Files:** `src/services/api.ts` (line 23), `app.json`
**Risk:** `baseURL` uses `http://` — Android 9+ blocks cleartext by default. All API calls fail silently.
**Impact:** App cannot communicate with backend on any Android 9+ device.
**Fix:** Add `expo-build-properties` to app.json with `usesCleartextTraffic: true`, or switch to HTTPS.

### C4. No GestureHandlerRootView
**Files:** `App.tsx` (lines 31–41)
**Risk:** TouchableOpacity and navigation gestures may have delayed/inconsistent feedback on Android without proper gesture handler setup.
**Impact:** Poor touch UX, especially on low-end devices.
**Fix:** Wrap app root in `<GestureHandlerRootView>`.

### C5. No SafeAreaView anywhere
**Files:** `App.tsx` (line 33), all screens
**Risk:** Content renders under status bar and navigation bar on notched devices. On older Android devices with physical nav bars, content may be clipped.
**Impact:** Layout breaks on devices with notches/gesture bars.
**Fix:** Wrap root view in `<SafeAreaView>` or use `useSafeAreaInsets()`.

---

## HIGH Issues

### H1. Math.random() as FlatList keyExtractor
**Files:** `src/screens/hod/FacultyScreen.tsx` (line 71)
**Risk:** `keyExtractor={(item: any) => item.id ?? Math.random().toString()}` — generates new keys every render. Causes React to unmount/remount every item, breaking focus, scroll position, and performance.
**Impact:** FlatList unusable on low-end Android.
**Fix:** Use stable unique key from data, or fallback to index consistently.

### H2. Index-based keyExtractors (5 screens)
**Files:**
- `src/screens/student/AttendanceScreen.tsx` (line 51)
- `src/screens/student/MarksScreen.tsx` (line 51)
- `src/screens/parent/AttendanceScreen.tsx` (line 43)
- `src/screens/parent/MarksScreen.tsx` (line 50)
- `src/screens/admin/UsersScreen.tsx` (line 85)
**Risk:** Index keys cause incorrect reconciliation when list mutates. On low-end Android, this manifests as flickering.
**Fix:** Use `item.usn` or `item.id` as key.

### H3. No FlatList performance props
**Files:** All 15+ FlatList usages
**Risk:** Missing `getItemLayout`, `windowSize`, `removeClippedSubviews`, `initialNumToRender`. On 3–4GB RAM devices, lists with 40+ items cause jank.
**Impact:** Laggy scrolling on class attendance lists (40 students).
**Fix:** Add performance props to list screens.

### H4. KeyboardAvoidingView disabled on Android
**Files:** `src/screens/LoginScreen.tsx` (line 95)
**Risk:** `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` — keyboard pushes content on iOS, but on Android no avoidance happens. Login form obscured on smaller screens.
**Impact:** Users cannot see password field while typing.
**Fix:** Use `behavior="height"` for Android.

### H5. Missing KeyboardAvoidingView on 7+ input screens
**Files:** SubjectPickerScreen, AttendanceSessionScreen, EditAttendanceScreen, IAMarksEntryScreen, BulkStudentEntryScreen, BatchCreateScreen, USNMappingScreen
**Risk:** Form inputs hidden behind keyboard on small screens.
**Impact:** Data entry impossible on 5" devices.
**Fix:** Wrap all screens with TextInputs in KeyboardAvoidingView or ScreenWrapper.

### H6. Tiny fonts — text-[9px] and text-[10px]
**Files:** 10+ locations across 8 files
- `HodDashboardScreen.tsx` (lines 124, 129, 160, 182)
- `principal/NoticesScreen.tsx` (line 69)
- `principal/AnalyticsScreen.tsx` (lines 78, 79, 92, 93)
- `admission/BulkStudentEntryScreen.tsx` (line 174)
- `admission/USNMappingScreen.tsx` (lines 102, 120)
- `admin/UsersScreen.tsx` (line 55)
- `faculty/IAMarksEntryScreen.tsx` (line 219)
**Risk:** Unreadable for faculty/parent users with visual impairment. Minimum readable is 12sp (text-xs).
**Impact:** Accessibility failure.
**Fix:** Bump to minimum `text-xs` (12px).

### H7. Poor color contrast
**Files:** Multiple screens
**Risk:** `text-slate-400` on `bg-slate-800` (~3.5:1 contrast) and `text-slate-500` on `bg-slate-800` (~2.5:1) fail WCAG AA (4.5:1).
**Impact:** Hard to read for older faculty members.
**Fix:** Use lighter text colors on dark backgrounds.

### H8. queryClient retry: 0
**Files:** `src/services/queryClient.ts` (line 15)
**Risk:** No automatic retry. On Indian mobile networks with packet loss, queries fail immediately.
**Impact:** Frequent "Network Error" on slow connections.
**Fix:** Set `retry: 2` with exponential backoff.

### H9. Touch targets below 44dp
**Files:**
- `src/components/Button.tsx` — no minHeight/minWidth
- `src/components/BackHeader.tsx` — text-only back button
- `src/screens/admission/BulkStudentEntryScreen.tsx` — +/- buttons at 40dp
**Risk:** Hard to tap, especially for faculty/parent users.
**Fix:** Add `min-h-[44px]` to buttons and touchable items.

### H10. Inline functions in FlatList renderItem
**Files:** `AttendanceSessionScreen.tsx` (line 186–203), `EditAttendanceScreen.tsx` (line 149)
**Risk:** Creates new function objects per item per render. On 40-student list, 40 functions created every render.
**Impact:** Unnecessary GC pressure on low-RAM devices.
**Fix:** Move handlers outside renderItem.

### H11. LoginScreen excessively dense
**Files:** `src/screens/LoginScreen.tsx` (lines 146–157)
**Risk:** 7 credential lines + 5 UI sections crammed in one card. On small screens, content overflows below fold AND is hidden by keyboard.
**Impact:** Poor first impression, hard to read.
**Fix:** Move demo credentials behind the "View Demo Credentials" screen.

### H12. pdfkit in dependencies — unused, heavy
**Files:** `package.json` (line 23)
**Risk:** pdfkit adds ~500KB+ to bundle. CPU-intensive when generating PDFs.
**Impact:** App bloat, potential Hermes GC pressure.
**Fix:** Remove if unused, or lazy-load when needed.

---

## MEDIUM Issues

### M1. Nested FlatLists in ScrollView
**Files:** `student/DashboardScreen.tsx` (lines 189, 218), `ReviewSubmitScreen.tsx` (line 162)
**Risk:** FlatList with `scrollEnabled={false}` inside ScrollView defeats virtualization — all items render upfront.
**Fix:** Use `map()` inside ScrollView instead of FlatList when nested.

### M2. PrincipalNavigator extra nesting
**Files:** `src/navigation/PrincipalNavigator.tsx` (lines 29–48)
**Risk:** Unnecessary Stack wrapping Tab navigator adds memory overhead.
**Fix:** Include DeptDetailScreen in Tab navigator.

### M3. Hardcoded random values in UI
**Files:** `hod/AnalyticsScreen.tsx` (lines 67, 82), `HodDashboardScreen.tsx` (line 156)
**Risk:** `Math.random()` for progress bar widths changes every render. Confusing and unreliable.
**Fix:** Use stable mock data.

### M4. Inconsistent background colors
**Files:** Mix of `bg-slate-900` and `bg-slate-950`
**Risk:** Visual inconsistency when navigating between screens.
**Fix:** Standardize on one background.

### M5. Dead code — ScreenWrapper unused
**Files:** `src/components/ScreenWrapper.tsx` (1–35)
**Risk:** Component with KeyboardAvoidingView + StatusBar never used. Developers may not know it exists.
**Fix:** Use it, or remove it.

### M6. Dead code — BackHeader used in only 1 screen
**Files:** `src/components/BackHeader.tsx`
**Risk:** Custom header component used only once.
**Fix:** Inline or consolidate.

### M7. Zustand re-export confusion (auth.ts)
**Files:** `src/store/auth.ts` — `export * from './authStore'`
**Risk:** Dual import paths (`auth` vs `authStore`) creates confusion.
**Fix:** Pick one canonical import path.

### M8. Empty onPress handlers
**Files:** `AdminDashboardScreen.tsx` (lines 136, 141, 146)
**Risk:** `onPress={() => {}}` — buttons do nothing. Confusing for demo users.
**Fix:** Wire up or remove.

### M9. Missing android splash screen config
**Files:** `app.json`
**Risk:** White flash on cold start.
**Fix:** Add `expo-splash-screen` with `android.splash` config.

### M10. Missing adaptive icon foreground
**Files:** `app.json`
**Risk:** Plain white circle as app icon on modern Android launchers.
**Fix:** Provide 108×108dp foreground asset.

---

## LOW Issues

### L1. Missing android.package in app.json
Cannot publish to Play Store.

### L2. No retry in rehydration
If SecureStore fails, app crashes.

### L3. Student Dashboard — missing cleanup guard
Potential "update after unmount" warning.

### L4. Unused AsyncStorage dependency
Minor bundle size increase.

### L5. Missing expo-build-properties plugin
Cannot customize Android build properties.

### L6. Tab bar fontSize: 11 — small labels
Hard to read on small screens.

### L7. React 19.1.0 — very new
Monitor for compatibility issues.

### L8. TypeScript 5.9 — very new
Monitor for tooling issues.

---

## Device Profiles Simulated

| Profile | RAM | Android | Screen | Target Users |
|---------|-----|---------|--------|--------------|
| Budget | 3GB | 11 | 5.5" HD+ | Students |
| Mid-range | 4GB | 13 | 6.2" FHD+ | Faculty |
| Older flagship | 4GB | 12 | 5.7" FHD | Parents |
| Budget Vivo/Oppo | 3GB | 10 | 6.0" HD+ | Students |

---

## Performance Optimization Recommendations

### For 3–4GB RAM devices:
1. Use `useCallback` on all event handlers passed to list items
2. Add `getItemLayout` to FlatLists when item heights are fixed
3. Set `windowSize={5}` and `removeClippedSubviews={true}` on all FlatLists
4. Avoid recreating objects in render (inline objects, arrow functions)
5. Use `React.memo` on list item components
6. Lazy-load PDF generation (if used)
7. Monitor Hermes GC by keeping render tree shallow

### For battery optimization on Android:
1. Avoid excessive network polling — use React Query's staleTime
2. Minimize re-renders from store subscriptions
3. No background services or location tracking needed

---

## Files Requiring Changes

| File | Issues |
|------|--------|
| `app.json` | C3, M9, M10, L1, L5 |
| `App.tsx` | C2, C4, C5 |
| `src/store/authStore.ts` | C1 |
| `src/services/queryClient.ts` | H8 |
| `src/services/api.ts` | C3 |
| `src/components/Button.tsx` | H9 |
| `src/components/BackHeader.tsx` | H9 |
| `src/screens/LoginScreen.tsx` | H4, H11 |
| `src/screens/hod/FacultyScreen.tsx` | H1 |
| `src/screens/student/AttendanceScreen.tsx` | H2, H3 |
| `src/screens/student/MarksScreen.tsx` | H2, H3 |
| `src/screens/parent/AttendanceScreen.tsx` | H2, H3 |
| `src/screens/parent/MarksScreen.tsx` | H2, H3 |
| `src/screens/admin/UsersScreen.tsx` | H2, H3 |
| `src/screens/AttendanceSessionScreen.tsx` | H3, H10 |
| `src/screens/EditAttendanceScreen.tsx` | H3, H5 |
| `src/screens/SubjectPickerScreen.tsx` | H5 |
| `src/screens/faculty/IAMarksEntryScreen.tsx` | H5 |
| `src/screens/admission/BulkStudentEntryScreen.tsx` | H5 |
| `src/screens/admission/BatchCreateScreen.tsx` | H5 |
| `src/screens/admission/USNMappingScreen.tsx` | H5 |

---

## Fix Priority Order

```
Day 1 (NOW):   C1, C2, C3, C4, C5 — app-crashing issues
Day 2:         H1, H2, H3, H8 — data integrity + performance
Day 3:         H4, H5, H9, H10 — usability
Day 4:         H6, H7, H11 — accessibility
Day 5:         M1–M10 — polish
Day 6:         L1–L8 — production readiness
```
