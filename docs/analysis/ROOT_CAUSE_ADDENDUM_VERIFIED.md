# Root Cause Addendum (Verified)

Date: 2026-05-11

This addendum supersedes earlier speculative points and records only findings validated by command output.

## Verified Environment Facts

- Project path is outside OneDrive sync folders.
- Expo Go is installed on emulator package host.exp.exponent.
- Emulator is connected via adb as emulator-5554.
- Metro is listening on port 8089, not 8081.
- ADB reverse mappings for 8081, 8082, 8089 are now present.
- ANDROID_HOME is set to C:\Users\jnane\AppData\Local\Android\Sdk.
- emulator.exe is not on PATH (not fatal, but inconvenient).

## Verified Dependency Findings (expo-doctor)

- Expo SDK: 54.0.34
- Expo Go app: 54.0.7
- Doctor failures:
  1. Missing peer dependency react-native-gesture-handler (required by @react-navigation/stack)
  2. Version mismatch: babel-preset-expo expected ~54.0.10, found 55.0.21
  3. Version mismatch: @react-native-async-storage/async-storage expected 2.2.0, found 3.0.2

## Corrected Root Cause Ranking

1. High: Dependency misalignment against SDK 54 (babel-preset-expo and async-storage)
2. High: Missing react-native-gesture-handler peer dependency
3. Medium: Metro on 8089 with intermittent reverse/network state in emulator sessions
4. Low: Windows environment baseline issues (not supported by current evidence)

## Immediate Safe Fixes

Run in project folder:

1) npm install --save-dev babel-preset-expo@~54.0.10
2) npm install @react-native-async-storage/async-storage@2.2.0
3) npx expo install react-native-gesture-handler
4) npx expo start --clear --port 8089

Then in another terminal:

1) adb reverse tcp:8089 tcp:8089
2) adb reverse --list

## Validation Checklist

- npx expo-doctor returns all checks passing.
- Expo Go opens project without white screen/intermittent load.
- Metro logs show successful bundle and fast refresh.

