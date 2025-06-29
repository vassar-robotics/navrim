import { exec, spawn, ChildProcess } from "child_process";
import { app } from "electron";
import fs from "fs";
import { platform } from "os";
import path from "path";
import { promisify } from "util";
import process from "node:process";
import net from "net";
import { BackendStatus, PortCheckResult } from "../types/ipc.ts";

const aexec = promisify(exec);

export default class Backend {
  private static instance: Backend | null = null;
  private platform: NodeJS.Platform;
  private homeDir: string;
  private venvDir: string;
  private phosphobotProcess: ChildProcess | null = null;

  private constructor() {
    this.platform = platform();
    this.homeDir = app.getPath("home");
    this.venvDir = path.join(this.homeDir, "venvs", "navrim");
    console.log("Backend venv dir:", this.venvDir);
  }

  static getInstance(): Backend {
    if (!Backend.instance) {
      Backend.instance = new Backend();
    }
    return Backend.instance;
  }

  /**
   * Cleanup method to properly shut down the backend
   */
  async cleanup(): Promise<void> {
    // Stop phosphobot if it's running
    if (this.phosphobotProcess && !this.phosphobotProcess.killed) {
      await this.stop();
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    if (Backend.instance) {
      Backend.instance.cleanup().catch(console.error);
      Backend.instance = null;
    }
  }

  async uv(): Promise<BackendStatus> {
    try {
      if (await this.checkCommand("uv")) {
        return {
          success: true,
          message: "uv is already installed",
        };
      }

      // install uv
      if (this.platform === "win32") {
        const script =
          `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`;
        await aexec(script, { shell: "powershell.exe" });
        return {
          success: true,
          message: "uv installed successfully",
        };
      } else if (this.platform === "darwin") {
        const script = `curl -LsSf https://astral.sh/uv/install.sh | sh`;
        await aexec(script, { shell: "/bin/bash" });
        this.addToPath(path.join(this.homeDir, ".local", "bin"));
        return {
          success: true,
          message: "uv installed successfully",
        };
      } else {
        return {
          success: false,
          message: `Platform ${this.platform} is not supported`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async phosphobot(): Promise<BackendStatus> {
    try {
      // Ensure uv is installed first
      if (!(await this.checkCommand("uv"))) {
        const uvInstall = await this.uv();
        if (!uvInstall.success) {
          return {
            success: false,
            message: `Failed to install uv: ${uvInstall.message}`,
          };
        }
      }

      // Ensure the parent directory exists
      const venvParentDir = path.dirname(this.venvDir);
      if (!fs.existsSync(venvParentDir)) {
        fs.mkdirSync(venvParentDir, { recursive: true });
      }

      // Check if venv already exists
      const venvPython = this.platform === "win32"
        ? path.join(this.venvDir, "Scripts", "python.exe")
        : path.join(this.venvDir, "bin", "python");

      if (!fs.existsSync(venvPython)) {
        // Create the virtual environment
        await aexec(`uv venv "${this.venvDir}"`);
      }

      // Install navrim-phosphobot in the venv
      await aexec(`uv pip install navrim-phosphobot`, {
        env: {
          ...process.env,
          VIRTUAL_ENV: this.venvDir,
        }
      });

      return {
        success: true,
        message: "phosphobot installed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async lerobot(): Promise<BackendStatus> {
    try {
      // Ensure uv is installed first
      if (!(await this.checkCommand("uv"))) {
        const uvInstall = await this.uv();
        if (!uvInstall.success) {
          return {
            success: false,
            message: `Failed to install uv: ${uvInstall.message}`,
          };
        }
      }

      // Ensure the parent directory exists
      const venvParentDir = path.dirname(this.venvDir);
      if (!fs.existsSync(venvParentDir)) {
        fs.mkdirSync(venvParentDir, { recursive: true });
      }

      // Check if venv already exists
      const venvPython = this.platform === "win32"
        ? path.join(this.venvDir, "Scripts", "python.exe")
        : path.join(this.venvDir, "bin", "python");

      if (!fs.existsSync(venvPython)) {
        // Create the virtual environment
        await aexec(`uv venv "${this.venvDir}"`);
      }

      // Install navrim-lerobot in the venv
      await aexec(`uv pip install navrim-lerobot`, {
        env: {
          ...process.env,
          VIRTUAL_ENV: this.venvDir,
        }
      });

      return {
        success: true,
        message: "lerobot installed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async launch(): Promise<BackendStatus> {
    try {
      // Check if phosphobot is already running
      if (this.phosphobotProcess && !this.phosphobotProcess.killed) {
        return {
          success: false,
          message: "phosphobot is already running",
        };
      }

      // Get the phosphobot executable path from the virtual environment
      const phosphobotExe = this.platform === "win32"
        ? path.join(this.venvDir, "Scripts", "phosphobot.exe")
        : path.join(this.venvDir, "bin", "phosphobot");

      // Check if the phosphobot executable exists
      if (!fs.existsSync(phosphobotExe)) {
        return {
          success: false,
          message: "phosphobot executable not found. Please install phosphobot first.",
        };
      }

      // Spawn the phosphobot process
      this.phosphobotProcess = spawn(phosphobotExe, ["run"], {
        env: {
          ...process.env,
          VIRTUAL_ENV: this.venvDir,
          PATH: this.platform === "win32"
            ? `${path.join(this.venvDir, "Scripts")};${process.env.PATH}`
            : `${path.join(this.venvDir, "bin")}:${process.env.PATH}`,
        },
        detached: false,
        stdio: ["ignore", "pipe", "pipe"],
      });

      // Handle process output
      this.phosphobotProcess.stdout?.on("data", (data) => {
        console.log(`phosphobot stdout: ${data.toString().trimEnd()}`);
      });

      this.phosphobotProcess.stderr?.on("data", (data) => {
        console.error(`phosphobot stderr: ${data.toString().trimEnd()}`);
      });

      // Handle process exit
      this.phosphobotProcess.on("exit", (code, signal) => {
        console.log(`phosphobot exited with code ${code} and signal ${signal}`);
        this.phosphobotProcess = null;
      });

      // Handle process errors
      this.phosphobotProcess.on("error", (error) => {
        console.error("phosphobot process error:", error);
        this.phosphobotProcess = null;
      });

      return {
        success: true,
        message: "phosphobot launched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Stop the phosphobot process if it's running
   */
  async stop(): Promise<BackendStatus> {
    try {
      if (!this.phosphobotProcess || this.phosphobotProcess.killed) {
        return {
          success: true,
          message: "phosphobot is not running",
        };
      }

      // Try graceful shutdown first
      this.phosphobotProcess.kill("SIGTERM");

      // Wait for process to exit gracefully
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          // Force kill if process doesn't exit gracefully
          if (this.phosphobotProcess && !this.phosphobotProcess.killed) {
            this.phosphobotProcess.kill("SIGKILL");
          }
          resolve();
        }, 5000); // 5 second timeout

        this.phosphobotProcess?.on("exit", () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      this.phosphobotProcess = null;
      return {
        success: true,
        message: "phosphobot stopped successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check if a service is running on the specified port
   */
  async checkPort(port: number): Promise<PortCheckResult> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 1000; // 1 second timeout

      socket.setTimeout(timeout);

      socket.on("connect", () => {
        socket.destroy();
        resolve({
          isReady: true,
          message: `Service is running on port ${port}`,
        });
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve({
          isReady: false,
          message: `Connection timeout on port ${port}`,
        });
      });

      socket.on("error", (error) => {
        socket.destroy();
        resolve({
          isReady: false,
          message: `Port ${port} is not ready: ${error.message}`,
        });
      });

      socket.connect(port, "localhost");
    });
  }

  /**
   * Helper method to check if a command exists
   */
  private async checkCommand(command: string): Promise<boolean> {
    try {
      const checkCmd = this.platform === "win32"
        ? `where ${command}`
        : `which ${command}`;

      await aexec(checkCmd);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper method to add a directory to PATH
   */
  private addToPath(dir: string): void {
    if (this.platform === "darwin") {
      // Add to shell profile files
      const profileFiles = [".zshrc", ".bash_profile", ".bashrc"];
      const exportLine = `export PATH="$PATH:${dir}"`;

      for (const file of profileFiles) {
        const filePath = path.join(this.homeDir, file);
        try {
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf8");
            if (!content.includes(dir)) {
              fs.appendFileSync(filePath, `\n${exportLine}\n`);
            }
          }
        } catch (error) {
          console.error(`Failed to update ${file}:`, error);
        }
      }
    }
    // For Windows, the installer typically handles PATH updates
  }
}
