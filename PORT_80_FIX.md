# Port 80 Issue and Fix

## Problem

The app was experiencing very slow startup times, getting stuck for up to 3 minutes at "Waiting for service to be ready...". 

### Root Cause

Phosphobot was configured to run on **port 80**, which is a privileged port on Unix-like systems (macOS, Linux). This caused several issues:

1. **Permission Issues**: Port 80 requires root/sudo privileges to bind on Unix systems
2. **Slow Startup**: Without proper privileges, the service may fail to bind or take a long time
3. **Long Timeout**: The app was waiting up to 180 seconds for the service to become available
4. **Silent Failures**: The service might fail to bind but not report clear errors

### Symptoms

- App gets stuck at "Waiting for service to be ready..."
- Takes 60-180 seconds to load
- Console shows: `PackageNotFoundError: No package metadata was found for 'phosphobot'` (this is just a warning, not the main issue)
- Eventually loads but feels very slow

## Solution

Changed phosphobot to use **port 8080** (non-privileged port) instead of port 80.

### Changes Made

#### 1. Environment Manager (`src/main/environment.ts`)
```typescript
// Before:
this.phosphobotProcess = spawn(phosphobotPath, ['run'], { ... });

// After:
this.phosphobotProcess = spawn(phosphobotPath, ['run', '--port', '8080'], { ... });
```

#### 2. Frontend Service Check (`src/renderer/App.tsx`)
```typescript
// Before:
const isAvailable = await checkPortAvailable(80);
window.location.href = 'http://localhost:80';

// After:
const isAvailable = await checkPortAvailable(8080);
window.location.href = 'http://localhost:8080';
```

#### 3. CopilotKit Configuration (`src/main/copilotkit.ts`)
```typescript
// Before:
remoteEndpoints: [{ url: 'http://localhost:80/chat/tools' }]

// After:
remoteEndpoints: [{ url: 'http://localhost:8080/chat/tools' }]
```

#### 4. Reduced Timeout
Also reduced the service wait timeout from 180 seconds to 60 seconds, with progress logging every 10 seconds.

## Benefits

✅ **Faster Startup**: No permission issues, service binds immediately
✅ **Better Logging**: Console now shows progress every 10 seconds
✅ **Clearer Errors**: If service doesn't start, you'll know within 60 seconds instead of 180
✅ **More Reliable**: Port 8080 doesn't require special privileges
✅ **Cross-Platform**: Works consistently on macOS, Linux, and Windows

## Verification

After this fix, the app should:
1. Start phosphobot in ~1-2 seconds
2. Detect the service is ready in ~2-5 seconds
3. Navigate to the phosphobot dashboard quickly
4. Show progress logs in the developer console

### Check Logs

Open Developer Tools (Cmd+Option+I) and you should see:
```
Waiting for phosphobot service on port 8080...
Service available after 3 seconds
Service ready, navigating to phosphobot...
```

### Verify Service

Check if phosphobot is running on port 8080:
```bash
lsof -i :8080
# Should show phosphobot process
```

Or visit directly:
```bash
open http://localhost:8080
```

## Troubleshooting

### Still Slow?

If the app is still slow after this fix:

1. **Check if phosphobot is starting:**
   ```bash
   ps aux | grep phosphobot
   ```

2. **Check the actual port:**
   ```bash
   lsof -i | grep phosphobot
   ```

3. **Check phosphobot logs in Developer Console:**
   - Look for stderr messages
   - Check for permission errors
   - Look for port binding errors

4. **Try starting phosphobot manually:**
   ```bash
   ~/Library/Application\ Support/Navrim/navrim-env/bin/phosphobot run --port 8080
   ```
   
   This should start immediately and show:
   ```
   INFO: Started server process
   INFO: Waiting for application startup.
   INFO: Application startup complete.
   INFO: Uvicorn running on http://0.0.0.0:8080
   ```

### Port Already in Use

If port 8080 is already taken:

```bash
# Check what's using port 8080
lsof -i :8080

# Kill the process (if safe to do so)
kill -9 <PID>

# Or choose a different port by modifying the spawn command:
# In src/main/environment.ts, change '8080' to another port like '8081'
```

## Background: Why Port 80?

Port 80 is the standard HTTP port, which is why it was initially chosen. However:

- **Ports 1-1023 are privileged** on Unix systems
- Binding to these ports requires root/sudo access
- Most development tools use non-privileged ports (3000, 8000, 8080, etc.)
- Port 8080 is a common alternative to port 80 for development

## Additional Notes

The `PackageNotFoundError` warning you see is unrelated to this fix. It's just phosphobot unable to determine its own version from package metadata. This doesn't affect functionality - phosphobot runs fine, it just can't display its version number (shows "unknown" instead).

---

**Last Updated:** 2025-10-02
**Issue:** Slow startup due to port 80 permission issues  
**Resolution:** Changed to port 8080
