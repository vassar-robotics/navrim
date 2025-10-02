# Phosphobot Termination Verification Steps

## Overview

This document provides step-by-step instructions to verify that phosphobot is properly terminated when the Navrim app closes.

## Changes Made

The following improvements were implemented to ensure phosphobot terminates correctly:

### 1. Enhanced `stopPhosphobot()` Method
**File:** `src/main/environment.ts`

- ✅ Graceful shutdown with SIGTERM signal
- ✅ 5-second timeout for graceful termination
- ✅ Force kill with SIGKILL if process doesn't respond
- ✅ Process tree termination (kills all child processes)
- ✅ Platform-specific handling (Unix/Windows)
- ✅ Comprehensive error handling
- ✅ Idempotent (safe to call multiple times)

### 2. Multiple App Lifecycle Hooks
**File:** `src/main/main.ts`

- ✅ `window-all-closed` event handler
- ✅ `before-quit` event handler
- ✅ `will-quit` event handler (new safety net)

### 3. Process Tree Termination
**File:** `src/main/environment.ts`

New `killProcessTree()` method that:
- Finds and kills child processes first
- Uses `pgrep` on Unix systems
- Uses `taskkill /T /F` on Windows
- Ensures no orphaned processes remain

## Verification Steps

### Before Testing

1. **Ensure the app builds successfully:**
   ```bash
   export https_proxy=http://127.0.0.1:6152
   export http_proxy=http://127.0.0.1:6152
   export all_proxy=socks5://127.0.0.1:6153
   
   npm install  # or pnpm install
   ```

2. **Kill any existing phosphobot processes:**
   ```bash
   # Run the helper script
   ./scripts/check-phosphobot.sh
   
   # Or manually
   pkill -9 phosphobot
   ```

### Test 1: Normal App Close

**Objective:** Verify phosphobot terminates when closing the app normally.

1. **Start the app:**
   ```bash
   export https_proxy=http://127.0.0.1:6152
   export http_proxy=http://127.0.0.1:6152
   export all_proxy=socks5://127.0.0.1:6153
   npm run start
   ```

2. **Complete the setup process:**
   - Wait for UV installation (if needed)
   - Wait for environment creation
   - Wait for phosphobot package installation
   - Wait for phosphobot to start

3. **Verify phosphobot is running:**
   ```bash
   # In a new terminal
   ps aux | grep phosphobot
   # or
   ./scripts/check-phosphobot.sh
   ```
   
   **Expected:** You should see phosphobot process(es) running.

4. **Close the app:**
   - Click the close button (X) on the app window
   - Or use Cmd+Q (Mac) / Alt+F4 (Windows/Linux)

5. **Immediately check if phosphobot is still running:**
   ```bash
   ps aux | grep phosphobot
   # or
   ./scripts/check-phosphobot.sh
   ```
   
   **Expected:** No phosphobot processes should be found.

6. **Check for orphaned processes:**
   ```bash
   pgrep -f phosphobot
   ```
   
   **Expected:** No output (exit code 1).

**Result:** ✅ PASS if no phosphobot processes remain

### Test 2: Force Quit App

**Objective:** Verify phosphobot terminates even if app is force-quit.

1. **Start the app and complete setup** (same as Test 1, steps 1-3)

2. **Force quit the app:**
   ```bash
   # Find the Electron process
   ps aux | grep -i electron | grep -i navrim
   
   # Force kill it (replace <PID> with actual PID)
   kill -9 <PID>
   ```

3. **Check if phosphobot terminated:**
   ```bash
   sleep 2  # Wait a moment
   ./scripts/check-phosphobot.sh
   ```
   
   **Expected:** No phosphobot processes should be found.

**Note:** Force quit might not trigger all cleanup handlers, but the `will-quit` event should still fire in most cases.

**Result:** ✅ PASS if no phosphobot processes remain

### Test 3: Multiple Start/Stop Cycles

**Objective:** Verify termination works consistently across multiple app sessions.

1. **Run 5 cycles of:**
   - Start app
   - Complete setup (first time only)
   - Wait for phosphobot to start
   - Close app normally
   - Verify phosphobot terminated

2. **After all cycles, check for any orphaned processes:**
   ```bash
   ./scripts/check-phosphobot.sh
   ```
   
   **Expected:** No phosphobot processes at all.

**Result:** ✅ PASS if all 5 cycles clean up properly

### Test 4: Unresponsive Phosphobot (Simulated)

**Objective:** Test the force kill mechanism.

This test requires modifying the phosphobot code temporarily to ignore SIGTERM signals.

**Alternative:** Use the test script provided:

```bash
node test-process-kill.js
```

This script simulates:
- Graceful termination (responsive process)
- Force kill (unresponsive process)
- Child process cleanup

**Expected Output:**
```
=== Test 1: Graceful Shutdown (responsive process) ===
✅ Process terminated gracefully

=== Test 2: Force Kill (unresponsive process) ===
✅ Process successfully force killed
```

**Result:** ✅ PASS if both test scenarios succeed

## Automated Verification

### Quick Check Script

Use the provided verification script:

```bash
./scripts/check-phosphobot.sh
```

This script:
- ✅ Detects running phosphobot processes
- ✅ Shows process details (PID, CPU, memory)
- ✅ Displays process tree
- ✅ Counts child processes
- ✅ Offers termination options

### Expected Output When Clean

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Phosphobot Process Checker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Searching for phosphobot processes...

✓ No phosphobot processes found - all clean!

ℹ Phosphobot has been properly terminated.
```

## Troubleshooting

### Issue: Phosphobot Still Running After App Closes

**Symptoms:**
- `ps aux | grep phosphobot` shows processes
- `./scripts/check-phosphobot.sh` finds running processes

**Diagnosis Steps:**

1. **Check app logs:**
   - Start app with dev tools open (Cmd+Option+I)
   - Close app
   - Look for termination messages:
     - "Stopping phosphobot process (PID: X) gracefully"
     - "Phosphobot did not terminate gracefully, forcing kill..."

2. **Check if app is actually quitting:**
   ```bash
   ps aux | grep -i electron | grep -i navrim
   ```
   If Electron process is still running, app didn't quit properly.

3. **Check process permissions:**
   ```bash
   ps -p <phosphobot_pid> -o user=
   ```
   Ensure it's your user, not root.

**Solutions:**

1. **Manual cleanup:**
   ```bash
   ./scripts/check-phosphobot.sh
   # Then choose option 3: Force kill process tree
   ```

2. **Increase timeout:**
   Edit `src/main/environment.ts`, line ~405:
   ```typescript
   }, 5000);  // Change to 10000 for 10 seconds
   ```

3. **Check for signal handling in phosphobot:**
   Phosphobot might be catching SIGTERM and not exiting.

### Issue: Child Processes Remain Running

**Symptoms:**
- Main phosphobot terminated but child processes still running
- `pstree -p <pid>` shows orphaned children

**Solutions:**

1. **Verify pgrep is available:**
   ```bash
   which pgrep
   ```

2. **Check if children are properly attached:**
   The spawn options should NOT include `detached: true`.

3. **Manual cleanup:**
   ```bash
   pkill -9 -f phosphobot  # Kills all matching processes
   ```

### Issue: Port Still in Use

**Symptoms:**
- Can't start app again because port 1212 is in use
- Phosphobot terminated but something else on port

**Check:**
```bash
lsof -i :1212
```

**Solution:**
```bash
# Kill process on port
kill -9 $(lsof -t -i:1212)
```

## Success Criteria

The implementation is working correctly if:

- ✅ **Test 1 passes:** Normal close terminates phosphobot
- ✅ **Test 2 passes:** Force quit terminates phosphobot
- ✅ **Test 3 passes:** Multiple cycles don't leave orphans
- ✅ **Test 4 passes:** Unresponsive processes are force-killed
- ✅ **No orphaned processes** after any termination method
- ✅ **No child processes remain** after termination
- ✅ **Port 1212 is released** after termination
- ✅ **App logs show termination messages** in developer console

## Additional Resources

- **Full Documentation:** See `PHOSPHOBOT_TERMINATION.md`
- **Test Script:** Run `node test-process-kill.js`
- **Check Script:** Run `./scripts/check-phosphobot.sh`
- **Main Logic:** `src/main/environment.ts` (stopPhosphobot method)
- **App Handlers:** `src/main/main.ts` (quit event handlers)

## Reporting Issues

If phosphobot termination is not working:

1. **Collect information:**
   ```bash
   # Process details
   ./scripts/check-phosphobot.sh
   
   # App logs (from developer console)
   # System info
   uname -a
   node --version
   ```

2. **Note the scenario:**
   - Which test failed?
   - How did you close the app?
   - Any error messages?

3. **Check platform-specific behavior:**
   - macOS might have different process group handling
   - Windows uses different kill mechanisms

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** Ready for Testing