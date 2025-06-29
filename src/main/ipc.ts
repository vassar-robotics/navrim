import { BrowserWindow, ipcMain } from "electron";
import { resolveHtmlPath } from "./util";
import Backend from "./backend.ts";
import {
  IPCChannels,
  InstallationProgress,
  PortCheckResult,
} from "../types/ipc.ts";

export default class IPCRegistry {
  private backend: Backend;

  constructor() {
    this.backend = Backend.getInstance();
  }

  registerAll() {
    // Navigation handler
    ipcMain.on(IPCChannels.NAVIGATE_TO, (event, destination: string) => {
      const currentWindow = BrowserWindow.fromWebContents(event.sender);
      if (!currentWindow) return;

      currentWindow.loadURL(destination).catch((err) => {
        console.error("Failed to load:", err);
        currentWindow.loadURL(resolveHtmlPath("index.html") + "?route=fallback");
      });
    });

    // Backend installation handlers
    ipcMain.handle(IPCChannels.INSTALL_UV, async (event) => {
      try {
                // Send progress update
        event.sender.send(IPCChannels.INSTALLATION_PROGRESS, {
          type: "uv",
          status: "installing",
          message: "Installing uv package manager..."
        } as InstallationProgress);

        const result = await this.backend.uv();

        // Send completion status
        event.sender.send(IPCChannels.INSTALLATION_PROGRESS, {
          type: "uv",
          status: result.success ? "completed" : "failed",
          message: result.message
        } as InstallationProgress);

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        event.sender.send(IPCChannels.INSTALLATION_PROGRESS, {
          type: "uv",
          status: "failed",
          message: errorMessage
        } as InstallationProgress);
        return { success: false, message: errorMessage };
      }
    });

    ipcMain.handle(IPCChannels.INSTALL_PHOSPHOBOT, async (event) => {
      try {
        // Send progress update
        event.sender.send(IPCChannels.INSTALLATION_PROGRESS, {
          type: "phosphobot",
          status: "installing",
          message: "Installing Phosphobot..."
        } as InstallationProgress);

        const result = await this.backend.phosphobot();

        // Send completion status
        event.sender.send(IPCChannels.INSTALLATION_PROGRESS, {
          type: "phosphobot",
          status: result.success ? "completed" : "failed",
          message: result.message
        } as InstallationProgress);

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        event.sender.send("installation-progress", {
          type: "phosphobot",
          status: "failed",
          message: errorMessage
        });
        return { success: false, message: errorMessage };
      }
    });

    ipcMain.handle(IPCChannels.INSTALL_LEROBOT, async (event) => {
      try {
        // Send progress update
        event.sender.send("installation-progress", {
          type: "lerobot",
          status: "installing",
          message: "Installing LeRobot..."
        });

        const result = await this.backend.lerobot();

        // Send completion status
        event.sender.send("installation-progress", {
          type: "lerobot",
          status: result.success ? "completed" : "failed",
          message: result.message
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        event.sender.send("installation-progress", {
          type: "lerobot",
          status: "failed",
          message: errorMessage
        });
        return { success: false, message: errorMessage };
      }
    });

    // Launch backend handler
    ipcMain.handle(IPCChannels.LAUNCH_BACKEND, async () => {
      try {
        const result = await this.backend.launch();
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: errorMessage };
      }
    });

    // Check port handler
    ipcMain.handle(IPCChannels.CHECK_PORT, async (event, port: number) => {
      try {
        const result = await this.backend.checkPort(port);
        return result;
      } catch (error) {
        return {
          isReady: false,
          message: error instanceof Error ? error.message : String(error),
        } as PortCheckResult;
      }
    });
  }
}
