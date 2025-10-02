# Phosphobot Process Termination Documentation

## Overview

This document explains how the Navrim desktop application manages the phosphobot process lifecycle, with special emphasis on ensuring proper termination when the app closes.

## Process Lifecycle

### Starting Phosphobot

Phosphobot is spawned as a child process when the user completes the environment setup:

1. The `EnvironmentManager.runPhosphobot()` method spawns the phosphobot executable
2. The process is tracked in `this.phosphobotProcess`
3. stdout/stderr are piped for logging
4. Exit handlers are registered to update process state

**Location:** `src/main/environment.ts` (line ~306)

### Termination Strategy

The application uses a **multi-layered approach** to ensure phosphobot is terminated when the app closes:

#### Layer 1: Graceful Shutdown (SIGTERM)

When the app closes, `stopPhosphobot()` first attempts a graceful shutdown:

```
1. Sends SIGTERM signal to phosphobot process
2. Allows phosphobot to clean up resources
3. Waits up to 5 seconds for graceful exit
```

**Benefit:** Allows phosphobot to properly close connections, flush buffers, etc.

#### Layer 2: Force Kill (SIGKILL)

If phosphobot doesn't respond to SIGTERM within 5 seconds:

```
1. Identifies all child processes using pgrep (Unix) or taskkill (Windows)
2. Kills child processes first with SIGKILL
3. Kills the main phosphobot process with SIGKILL
```

**Benefit:** Ensures termination even if phosphobot hangs or becomes unresponsive.

#### Layer 3: Process Tree Termination

The `killProcessTree()` method ensures complete cleanup:

- **Unix/Linux/macOS:** Uses `pgrep -P` to find children, then kills them individually
- **Windows:** Uses `taskkill /T /F` to terminate the entire process tree

**Benefit:** Prevents orphaned child processes from continuing to run.

## App Event Handlers

The termination logic is triggered by multiple Electron app events for maximum reliability:

### 1. `window-all-closed` Event

Triggered when the last window is closed.

```javascript
app.on('window-all-closed', () => {
  envManager.setLogCallback(null);
  envManager.stopPhosphobot();
  app.quit();
});
```

**When:** User clicks the close button on the last window.

### 2. `before-quit` Event

Triggered before the app begins quitting.

```javascript
app.on('before-quit', () => {
  envManager.setLogCallback(null);
  envManager.stopPhosphobot();
});
```

**When:** User selects "Quit" from menu, or system shutdown initiated.

### 3. `will-quit` Event

Final safety net before app quits.

```javascript
app.on('will-quit', () => {
  envManager.stopPhosphobot();
});
```

**When:** Last chance to clean up before process termination.

## Edge Cases Handled

### Multiple Calls to stopPhosphobot()

The method is **idempotent** - safe to call multiple times:

```javascript
if (this.phosphobotProcess && !this.phosphobotProcess.killed) {
  // Only attempt termination if process exists and isn't already killed
}
```

### Race Conditions

- Timeout is cleared when process exits naturally
- Process reference is nullified after termination
- Exit handlers prevent double-cleanup

### Platform Differences

| Platform | Primary Method | Fallback |
|----------|---------------|----------|
| **macOS/Linux** | `pgrep -P` + `kill()` | SIGKILL on parent |
| **Windows** | `taskkill /pid PID /T /F` | N/A |

### Unresponsive Processes

- 5-second timeout before force kill
- Separate kill attempts for children and parent
- Error handling prevents termination failures from blocking app quit

## Verification

### Manual Testing

1. **Start the app** and complete phosphobot setup
2. **Verify phosphobot is running:**
   ```bash
   ps aux | grep phosphobot
   ```
3. **Close the app normally** (click close button)
4. **Check if phosphobot terminated:**
   ```bash
   ps aux | grep phosphobot  # Should show no results
   ```

### Automated Testing

Run the provided test script:

```bash
node test-process-kill.js
```

This tests:
- ✅ Graceful termination with responsive process
- ✅ Force kill with unresponsive process
- ✅ Child process cleanup

## Logging

Termination events are logged via the `log()` method:

```
Stopping phosphobot process (PID: 12345) gracefully
Phosphobot did not terminate gracefully, forcing kill of entire process tree
```

View logs in the app's developer console (View → Toggle Developer Tools).

## Troubleshooting

### Phosphobot Still Running After App Closes

**Symptoms:** Process visible in Activity Monitor/Task Manager after app quits.

**Possible Causes:**
1. Process became zombified (defunct)
2. Force kill timeout wasn't reached
3. Insufficient permissions to kill process

**Solutions:**
1. Manually kill the process:
   ```bash
   # macOS/Linux
   pkill -9 phosphobot
   
   # Windows
   taskkill /F /IM phosphobot.exe
   ```

2. Check app logs for termination errors

3. Increase force kill timeout in `environment.ts` (currently 5000ms)

### Orphaned Child Processes

**Symptoms:** Child processes of phosphobot still running.

**Check:**
```bash
# macOS/Linux - Find orphaned processes
ps -ef | grep phosphobot
pstree -p <phosphobot_pid>  # View process tree
```

**Solution:** The current implementation should handle this, but if issues persist:
1. Verify `pgrep` is available on the system
2. Check if child processes are detached (they shouldn't be)

## Implementation Details

### Key Files

- `src/main/environment.ts` - Process management logic
- `src/main/main.ts` - App lifecycle event handlers
- `test-process-kill.js` - Testing script

### Key Methods

```typescript
// Start phosphobot
async runPhosphobot(): Promise<{ success: boolean; error?: string }>

// Stop phosphobot (graceful + force)
stopPhosphobot(): void

// Kill entire process tree
private async killProcessTree(pid: number): Promise<void>
```

## Best Practices

1. **Always call stopPhosphobot() before app quit** ✅ Implemented
2. **Use timeouts to prevent hanging** ✅ Implemented (5s timeout)
3. **Kill process trees, not just parent** ✅ Implemented
4. **Handle platform differences** ✅ Implemented
5. **Log termination events** ✅ Implemented
6. **Make termination idempotent** ✅ Implemented

## Future Improvements

Potential enhancements for even more robust termination:

1. **IPC Shutdown Command**: Send a shutdown message to phosphobot over IPC before SIGTERM
2. **Health Check**: Verify phosphobot actually stopped by checking its port/socket
3. **Configurable Timeout**: Make the 5-second timeout configurable
4. **Graceful Period Extension**: Give phosphobot more time if it acknowledges the shutdown request
5. **Process Monitor**: Detect if phosphobot crashes unexpectedly during runtime

## Conclusion

The current implementation provides **robust, multi-layered protection** to ensure phosphobot is properly terminated when Navrim closes. The combination of:

- Graceful shutdown attempts
- Force kill with timeout
- Process tree termination
- Multiple app lifecycle hooks
- Platform-specific handling

...ensures that phosphobot will not continue running as an orphaned process after the app closes.

---

**Last Updated:** 2024
**Maintained By:** Navrim Team