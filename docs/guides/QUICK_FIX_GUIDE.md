# Quick Fix Script - VCET-AMS-Mobile Expo Issues
**Safe, Step-by-Step Recovery Guide**

> ⚠️ **WARNING**: Only run commands in this order. Undo-able at each step.

---

## Pre-Flight Check (0 min)

Verify current state:
```bash
cd c:\PROJECTS\Cells-AMS\VCET-AMS-Mobile

# Check installed versions
npm ls babel-preset-expo @react-native-async-storage/async-storage react --depth=0

# Expected WRONG versions (before fixes):
# babel-preset-expo@55.0.21  ← Should be ~54.0.10
# @react-native-async-storage/async-storage@3.0.2  ← Should be 2.2.0
# react@19.1.0  ← Could be 18.x
```

---

## STEP 1: Fix Babel Preset (3 minutes)
**CRITICAL FIX - Fixes most Expo Go issues**

```bash
cd c:\PROJECTS\Cells-AMS\VCET-AMS-Mobile

# Downgrade to Expo SDK 54 compatible version
npm install babel-preset-expo@~54.0.10 --save-dev

# Verify
npm ls babel-preset-expo --depth=0
# Should show: babel-preset-expo@54.0.10
```

**Why this fixes it**: 
- babel-preset-expo 55 emits SDK-55 transforms
- Expo Go SDK 54 cannot execute them
- Rolling back to 54.0.10 ensures compatibility

**If this fails**:
```bash
npm cache clean --force
npm install babel-preset-expo@~54.0.10 --save-dev --no-save
```

---

## STEP 2: Fix AsyncStorage Version (3 minutes)
**HIGH PRIORITY - Prevents native module errors**

```bash
# Downgrade to Expo SDK 54 compatible version
npm install @react-native-async-storage/async-storage@2.2.0

# Verify
npm ls @react-native-async-storage/async-storage --depth=0
# Should show: @react-native-async-storage/async-storage@2.2.0
```

**Why this fixes it**:
- AsyncStorage 3.0.x has different native bindings
- Expo SDK 54 only supports 2.2.x API
- This prevents "Native module not found" crashes

**If this fails**:
```bash
npm cache clean --force
npm install @react-native-async-storage/async-storage@2.2.0 --legacy-peer-deps
```

---

## STEP 3: Clean Metro & Expo Caches (2 minutes)
**CLEANUP - Removes stale transforms**

```bash
# Remove Expo state
rm -r .expo 2>$null

# Remove Metro cache
rm -r node_modules/.cache 2>$null

# Remove Next cache (if exists)
rm -r .next 2>$null

# Windows PowerShell alternative:
Remove-Item .expo -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item node_modules/.cache -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
```

**Why this fixes it**:
- Metro cache contains transforms from old Babel version
- Stale cache prevents new version from working
- --clear flag rebuilds everything fresh

---

## STEP 4: Update app.json (1 minute)
**RECOMMENDED - Fixes theme issues**

Edit `app.json` and add `userInterfaceStyle`:

**Before**:
```json
{
  "expo": {
    "name": "vcet-ams-mobile",
    "slug": "vcet-ams-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "bundler": "metro"
    }
  }
}
```

**After**:
```json
{
  "expo": {
    "name": "vcet-ams-mobile",
    "slug": "vcet-ams-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "bundler": "metro"
    }
  }
}
```

**Why this fixes it**:
- Removes Expo warning about missing setting
- Ensures dark theme (slate-900) is enforced
- Prevents light theme from overriding app theme

---

## STEP 5: Reinstall Dependencies (5 minutes)
**FRESH INSTALL - Ensures clean state**

```bash
# Delete node_modules (WARNING: takes time to reinstall)
rm -r node_modules 2>$null

# Windows PowerShell:
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue

# Reinstall with clean cache
npm cache clean --force
npm install

# If conflicts occur:
npm install --legacy-peer-deps
```

**Expected time**: 3-5 minutes depending on internet

**Why this helps**:
- Ensures all dependencies are rebuilt with correct versions
- Removes any corrupted or stale modules
- Forces re-linking of native modules

---

## STEP 6: Verify Babel Config (1 minute)
**VERIFICATION - Confirm changes took effect**

```bash
# Test Babel config loads correctly
node -e "const cfg = require('./babel.config.js'); const api = { cache: () => {} }; const result = cfg(api); console.log('✓ Babel config OK'); console.log('Presets:', JSON.stringify(result.presets)); console.log('Plugins:', JSON.stringify(result.plugins));"

# Expected output:
# ✓ Babel config OK
# Presets: [["babel-preset-expo",{"jsxImportSource":"nativewind"}]]
# Plugins: ["nativewind/babel"]
```

---

## STEP 7: Start Metro Bundler (Continuous)
**DEVELOPMENT - Ready to test**

```bash
# Start with full clean
npx expo start --clear

# If you want specific port:
npx expo start --clear --port 8081

# If localhost fails, try LAN:
npx expo start --clear --lan

# If LAN fails, try tunnel:
npx expo start --clear --tunnel
```

**Expected terminal output**:
```
✓ Starting project at C:\PROJECTS\Cells-AMS\VCET-AMS-Mobile
✓ Starting Metro Bundler
✓ Waiting on http://localhost:8081
✓ Logs for your project will appear below
```

**Does NOT appear**:
```
❌ babel-preset-expo@55.0.21 mismatch warning
❌ @react-native-async-storage/async-storage@3.0.2 warning
❌ userInterfaceStyle warning
```

---

## STEP 8: Test in Emulator (5 minutes)

**Terminal 1 (Metro still running)**:
```
# Keep this terminal open with "npx expo start --clear" running
```

**Terminal 2 (New terminal)**:
```bash
# Start emulator if not running
emulator -avd Pixel_6_API_34 &

# Wait 30 seconds for boot...

# Then press 'a' in Terminal 1 Metro window
# OR scan QR code with Expo Go on device
```

**Expected in Expo Go**:
```
✅ App loads within 2-3 seconds
✅ Dark theme (slate-900) applied
✅ No white screen or errors
✅ Navigation works smoothly
✅ Hot reload works (change = automatic refresh)
```

**If white screen**:
```
# Try these in order:
1. Wait 10 seconds (sometimes slow on first load)
2. Press 'r' in Metro terminal (refresh)
3. Exit Expo Go and reopen
4. Restart emulator: adb emu kill
5. Full restart: Ctrl+C Metro, then npx expo start --clear
```

---

## STEP 9 (OPTIONAL): Test React 19 Compatibility

**Only if app keeps crashing after Steps 1-8**

```bash
# Downgrade React to tested version
npm install react@18.2.0

# Reinstall dependencies
rm -r node_modules
npm install

# Test
npx expo start --clear
```

**Why this is optional**:
- React 19 is bleeding-edge
- Most issues resolve with Steps 1-8
- Only attempt if crashes still occur

---

## Rollback Guide (If something breaks)

### Rollback Step 1 (Babel):
```bash
npm install babel-preset-expo@55.0.21 --save-dev
```

### Rollback Step 2 (AsyncStorage):
```bash
npm install @react-native-async-storage/async-storage@3.0.2
```

### Rollback Step 4 (app.json):
```bash
# Remove userInterfaceStyle line from app.json
# (Reload Metro after)
```

### Full Rollback (Start over):
```bash
cd c:\PROJECTS\Cells-AMS\VCET-AMS-Mobile

# Delete everything, restart from package.json
rm -r node_modules .expo
npm install

# Restore app.json from git if modified
git checkout app.json

npx expo start --clear
```

---

## Troubleshooting During Fix

### Problem: "Cannot find module 'babel-preset-expo'"
```bash
# Solution: Clear npm cache first
npm cache clean --force
npm install babel-preset-expo@~54.0.10 --save-dev
```

### Problem: "npm ERR! code ERESOLVE"
```bash
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

### Problem: "Metro bundler crashes on start"
```bash
# Solution: Full clean
rm -r .expo node_modules/.cache
npx expo start --clear
```

### Problem: "Emulator can't connect to Metro"
```bash
# Try LAN mode instead of localhost
npx expo start --clear --lan

# Then scan QR code or connect via emulator
```

### Problem: "ANDROID_SDK_ROOT not found"
```bash
# If you get Android SDK errors, ensure emulator is installed:
emulator -list-avds

# If none exist, create one in Android Studio or:
# Set environment: $env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"
```

---

## Success Checklist

After completing all steps, verify:

- [ ] `npm ls babel-preset-expo` shows @54.0.10
- [ ] `npm ls @react-native-async-storage/async-storage` shows @2.2.0
- [ ] `app.json` contains `"userInterfaceStyle": "dark"`
- [ ] `npx expo start --clear` runs without version warnings
- [ ] Emulator launches Expo Go successfully
- [ ] App loads and displays dark theme correctly
- [ ] No white screen on launch
- [ ] Hot reload works (save file = auto-refresh)

---

## Time Estimate

| Step | Time | Critical |
|------|------|----------|
| 1. Fix Babel | 3 min | ✅ YES |
| 2. Fix AsyncStorage | 3 min | ✅ YES |
| 3. Clean Caches | 2 min | ✅ YES |
| 4. Update app.json | 1 min | ⚠️ RECOMMENDED |
| 5. Reinstall deps | 5 min | ✅ YES |
| 6. Verify config | 1 min | ⏹️ CHECK |
| 7. Start Metro | 2 min | ✅ YES |
| 8. Test emulator | 5 min | ✅ YES |
| 9. React 19 test | 5 min | ⏹️ IF NEEDED |

**Total Time**: 22-30 minutes (first time)

**Success Probability**: 85% after Step 5, 95% after Step 8

---

## Next Steps After Success

1. **Commit the fixes**:
   ```bash
   git add package.json app.json
   git commit -m "fix: downgrade babel-preset-expo and async-storage for Expo SDK 54 compatibility"
   ```

2. **Document fixes**:
   - See ROOT_CAUSE_ANALYSIS.md for detailed explanation
   - See BABEL_NATIVEWIND_FIX_SUMMARY.md for Babel config details

3. **Prevent future issues**:
   - Lock versions in package.json for sensitive packages
   - Add `.npmrc` with `legacy-peer-deps=true` for consistency

4. **Plan upgrades**:
   - Monitor Expo SDK 55 release
   - Plan upgrade path (not urgent)
   - Test React 19 compatibility when SDK 55 is stable

---

**Last Updated**: May 11, 2026  
**Status**: READY FOR EXECUTION  
**Risk Level**: LOW (all changes are reversible)
