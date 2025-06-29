/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
const todesktop = require("@todesktop/runtime");

import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { startCopilotKitServer } from './copilotkit';
import { EnvironmentManager } from './environment';

todesktop.init();

let mainWindow: BrowserWindow | null = null;

// Register environment management IPC handlers
const envManager = EnvironmentManager.getInstance();

ipcMain.handle('check-uv', async () => {
  return envManager.checkUvInstalled();
});

ipcMain.handle('install-uv', async () => {
  try {
    await envManager.installUv();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-env', async () => {
  try {
    await envManager.createVirtualEnvironment();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-package', async (event, packageName?: string) => {
  try {
    await envManager.installPackage(packageName);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('env-status', async () => {
  return envManager.checkEnvironmentReady();
});

ipcMain.handle('run-phosphobot', async () => {
  return envManager.runPhosphobot();
});

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

const isDebug = process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true";

if (isDebug) {
  require("electron-debug").default();
}

const installExtensions = () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS"];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../../assets");

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, "preload.js")
        : path.join(__dirname, "../../.erb/dll/preload.js"),
      // Enable web security settings for loading external content
      webSecurity: true,
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  // Load from localhost:80
  mainWindow.loadURL('http://localhost:80').catch((err) => {
    console.error('Failed to load localhost:80:', err);
    // Fallback to loading the bundled index.html if the server is not running
    mainWindow?.loadURL(resolveHtmlPath('index.html'));
  });

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: "deny" };
  });

};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Stop phosphobot when closing the app
  envManager.stopPhosphobot();

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  // if (process.platform !== 'darwin') {
  app.quit();
  // }
});

app.on("before-quit", async (event) => {
  app.exit();
});

app.on('before-quit', () => {
  // Ensure phosphobot is stopped before quitting
  envManager.stopPhosphobot();
});

app
  .whenReady()
  .then(() => {
    createWindow();
    startCopilotKitServer();
    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
