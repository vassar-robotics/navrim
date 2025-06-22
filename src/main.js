const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const BackendInstaller = require('./backend-installer');

let store;
let mainWindow;
let setupWindow = null;
let lerobotProcess = null;
let lerobotPort = 8000;
let backendInstaller = null;

// Check if it's development environment
const isDev = process.env.NODE_ENV === 'development';

// Add debug information
console.log('Environment:', process.env.NODE_ENV);
console.log('Is Development:', isDev);

// Asynchronously initialize electron-store
async function initStore() {
  const Store = (await import('electron-store')).default;
  store = new Store();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    icon: path.join(__dirname, '../resources/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load frontend
  const indexPath = isDev 
    ? 'http://localhost:5173'  // Development environment - Vite port (use 5174 if 5173 is occupied)
    : `file://${path.join(__dirname, '../dist/index.html')}`; // Production environment

  console.log('Loading URL:', indexPath);
  mainWindow.loadURL(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Check if first-time setup is needed
    if (!store.get('lerobotSetup.completed', false)) {
      showSetupDialog();
    }
    // Temporarily comment out backend startup to ensure frontend displays properly first
    // else {
    //   startLerobotBackend();
    // }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (lerobotProcess) {
      lerobotProcess.kill();
      lerobotProcess = null;
    }
  });

  // Open developer tools in development environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Show setup dialog
function showSetupDialog() {
  setupWindow = new BrowserWindow({
    width: 600,
    height: 500,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: false,
    minimizable: false,
    maximizable: false
  });

  setupWindow.loadFile(path.join(__dirname, '../resources/setup.html'));
  
  // Open developer tools in development environment
  if (isDev) {
    setupWindow.webContents.openDevTools();
  }
  
  setupWindow.on('closed', () => {
    setupWindow = null;
    // If user closed setup window without completing setup, ask whether to exit
    if (!store.get('lerobotSetup.completed', false)) {
      const response = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: ['Exit', 'Setup Again'],
        defaultId: 1,
        message: 'Initial setup not completed',
        detail: 'LeRobot backend setup is required to use the application. Would you like to setup again?'
      });
      
      if (response === 0) {
        app.quit();
      } else {
        showSetupDialog();
      }
    }
  });
}

// Setup LeRobot using BackendInstaller
async function setupLerobot(installPath) {
  try {
    backendInstaller = new BackendInstaller();
    
    // Set progress callback
    backendInstaller.setProgressCallback((progress) => {
      if (setupWindow) {
        setupWindow.webContents.send('setup-progress', progress);
      }
    });

    // Start installation
    const result = await backendInstaller.install(installPath);
    
    if (result.success) {
      // Save installation configuration
      store.set('lerobotSetup', {
        completed: true,
        installPath: installPath,
        pythonPath: result.pythonPath,
        lerobotPath: result.lerobotPath,
        venvPath: result.venvPath
      });
      
      return { success: true };
    } else {
      throw new Error('Installation failed');
    }
  } catch (error) {
    console.error('Setup error:', error);
    throw error;
  }
}

// Start LeRobot backend
function startLerobotBackend() {
  // Temporarily disable backend startup logic, LeRobot doesn't have built-in server module
  console.log('Backend startup is temporarily disabled');
  return;
  
  /* Commented out backend startup code
  const setupConfig = store.get('lerobotSetup');
  
  if (!setupConfig || !setupConfig.completed) {
    console.error('LeRobot not installed');
    return;
  }

  try {
    const pythonPath = setupConfig.pythonPath;
    const lerobotPath = setupConfig.lerobotPath;
    
    // Start LeRobot server
    // Note: This needs to be adjusted according to actual LeRobot startup command

    console.log(pythonPath, lerobotPath);
    lerobotProcess = spawn(pythonPath, ['-m', 'uvicorn', 'lerobot.server:app', '--host', '0.0.0.0', '--port', lerobotPort.toString()], {
      cwd: lerobotPath,
      env: { ...process.env, PYTHONPATH: lerobotPath }
    });

    lerobotProcess.stdout.on('data', (data) => {
      console.log(`LeRobot stdout: ${data}`);
      if (mainWindow) {
        mainWindow.webContents.send('backend-log', {
          type: 'stdout',
          message: data.toString()
        });
      }
    });

    lerobotProcess.stderr.on('data', (data) => {
      console.error(`LeRobot stderr: ${data}`);
      if (mainWindow) {
        mainWindow.webContents.send('backend-log', {
          type: 'stderr',  
          message: data.toString()
        });
      }
    });

    lerobotProcess.on('close', (code) => {
      console.log(`LeRobot process exited with code ${code}`);
      lerobotProcess = null;
      if (mainWindow) {
        mainWindow.webContents.send('backend-status', {
          running: false,
          code: code
        });
      }
    });

    // Notify frontend that backend has started
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.webContents.send('backend-status', {
          running: true,
          port: lerobotPort,
          url: `http://localhost:${lerobotPort}`
        });
      }
    }, 5000); // Give backend some startup time

  } catch (error) {
    console.error('Failed to start LeRobot backend:', error);
    if (mainWindow) {
      mainWindow.webContents.send('backend-error', {
        message: error.message
      });
    }
  }
  */
}

// IPC event handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('choose-install-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    defaultPath: os.homedir(),
    title: 'Choose LeRobot Installation Directory'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('setup-lerobot', async (event, installPath) => {
  try {
    await setupLerobot(installPath);
    return { success: true };
  } catch (error) {
    console.error('Setup error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('start-backend', () => {
  startLerobotBackend();
  return { success: true };
});

ipcMain.handle('stop-backend', () => {
  if (lerobotProcess) {
    lerobotProcess.kill();
    lerobotProcess = null;
    return { success: true };
  }
  return { success: false, message: 'Backend not running' };
});

ipcMain.handle('get-backend-status', () => {
  return {
    running: lerobotProcess !== null,
    port: lerobotPort,
    url: `http://localhost:${lerobotPort}`
  };
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

// App event handlers
app.whenReady().then(async () => {
  await initStore();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (lerobotProcess) {
    lerobotProcess.kill();
  }
}); 