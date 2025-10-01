import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { app } from 'electron';
import { spawn, ChildProcess } from 'child_process';

const execAsync = promisify(exec);

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private envPath: string;
  private phosphobotProcess: ChildProcess | null = null;
  private logCallback: ((message: string) => void) | null = null;

  constructor() {
    // Store virtual environment in app's user data directory
    const userDataPath = app.getPath('userData');
    this.envPath = path.join(userDataPath, 'navrim-env');
  }

  static getInstance(): EnvironmentManager {
    if (!this.instance) {
      this.instance = new EnvironmentManager();
    }
    return this.instance;
  }

  setLogCallback(callback: ((message: string) => void) | null) {
    this.logCallback = callback;
  }

  private log(message: string) {
    console.log(message); // Keep console.log for debugging
    if (this.logCallback) {
      this.logCallback(message);
    }
  }

  private getEnhancedEnv(): NodeJS.ProcessEnv {
    // Common uv installation paths
    const commonPaths = [
      path.join(os.homedir(), '.local', 'bin'),
      path.join(os.homedir(), '.cargo', 'bin'),
      '/usr/local/bin',
      '/opt/homebrew/bin',
    ];

    // Add common paths to PATH
    const enhancedPath =
      commonPaths.join(path.delimiter) +
      path.delimiter +
      (process.env.PATH || '');

    return {
      ...process.env,
      PATH: enhancedPath,
    };
  }

  async checkUvInstalled(): Promise<boolean> {
    try {
      this.log('Checking if uv is installed...');
      const { stdout } = await execAsync('uv --version', {
        env: this.getEnhancedEnv(),
      });
      this.log(`UV version: ${stdout.trim()}`);
      return true;
    } catch (error) {
      this.log(`UV not found: ${error}`);
      return false;
    }
  }

  async installUv(): Promise<void> {
    // Check if uv is already installed
    const isInstalled = await this.checkUvInstalled();
    if (isInstalled) {
      this.log('UV is already installed');
      return;
    }

    const platform = os.platform();
    let installCommand: string;

    if (platform === 'darwin' || platform === 'linux') {
      // macOS and Linux use curl to install
      installCommand = 'curl -LsSf https://astral.sh/uv/install.sh | sh';
    } else if (platform === 'win32') {
      // Windows uses PowerShell
      installCommand =
        'powershell -ExecutionPolicy ByPass -Command "irm https://astral.sh/uv/install.ps1 | iex"';
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    this.log(`Installing UV with command: ${installCommand}`);

    try {
      const { stdout, stderr } = await execAsync(installCommand, {
        shell: true,
        env: this.getEnhancedEnv(),
      } as any);

      if (stderr && !stderr.includes('warning')) {
        this.log(`UV installation stderr: ${stderr}`);
      }

      this.log(`UV installation stdout: ${stdout}`);

      // Verify installation succeeded
      const isInstalled = await this.checkUvInstalled();
      if (!isInstalled) {
        throw new Error('UV installation completed but verification failed');
      }
    } catch (error: any) {
      this.log(`Failed to install UV: ${error}`);
      throw new Error(`Failed to install UV: ${error.message}`);
    }
  }

  async createVirtualEnvironment(): Promise<void> {
    try {
      // Check if environment already exists
      if (fs.existsSync(this.envPath)) {
        this.log(`Virtual environment already exists at ${this.envPath}`);
        return;
      }

      // Create virtual environment with Python 3.12
      const { stdout, stderr } = await execAsync(
        `uv venv -p 3.10 "${this.envPath}"`,
        {
          shell: true,
          env: this.getEnhancedEnv(),
        } as any,
      );

      if (stderr && !stderr.includes('warning')) {
        this.log(`Create venv stderr: ${stderr}`);
      }

      this.log(`Virtual environment created: ${stdout}`);
    } catch (error: any) {
      this.log(`Failed to create virtual environment: ${error}`);
      throw new Error(`Failed to create virtual environment: ${error.message}`);
    }
  }

  async installPackage(
    packageName: string = 'navrim-phosphobot',
  ): Promise<void> {
    try {
      // Use uv pip install to install package in virtual environment
      const command = `uv pip install -U ${packageName}`;

      this.log(`Installing package: ${packageName}`);
      this.log(`Running command: ${command}`);

      const { stdout, stderr } = await execAsync(command, {
        shell: true,
        env: {
          ...this.getEnhancedEnv(),
          VIRTUAL_ENV: this.envPath,
          UV_PROJECT_ENVIRONMENT: this.envPath,
        },
      } as any);

      if (stdout) {
        this.log(`Package installation output: ${stdout}`);
      }

      if (stderr && !stderr.includes('warning')) {
        this.log(`Package installation stderr: ${stderr}`);
      }

      await this.checkPackageVersion(packageName);
    } catch (error: any) {
      this.log(`Failed to install package: ${error}`);
      throw new Error(`Failed to install package: ${error.message}`);
    }
  }

  async checkPackageVersion(packageName: string): Promise<void> {
    const { stdout } = await execAsync(`uv pip show ${packageName}`, {
      shell: true,
      env: {
        ...this.getEnhancedEnv(),
        VIRTUAL_ENV: this.envPath,
        UV_PROJECT_ENVIRONMENT: this.envPath,
      },
    } as any);

    this.log(`${packageName} version: ${stdout.toString()}`);
  }

  async checkEnvironmentReady(): Promise<{
    uvInstalled: boolean;
    envExists: boolean;
    packageInstalled: boolean;
  }> {
    const uvInstalled = await this.checkUvInstalled();
    const envExists = fs.existsSync(this.envPath);

    let packageInstalled = false;
    if (envExists) {
      try {
        // Check if package is installed
        const { stdout } = await execAsync('uv pip list', {
          shell: true,
          env: {
            ...this.getEnhancedEnv(),
            VIRTUAL_ENV: this.envPath,
            UV_PROJECT_ENVIRONMENT: this.envPath,
          },
        } as any);
        packageInstalled =
          stdout.includes('navrim-phosphobot') &&
          stdout.includes('navrim-lerobot');
      } catch (error) {
        this.log(`Failed to check package installation: ${error}`);
      }
    }

    return {
      uvInstalled,
      envExists,
      packageInstalled,
    };
  }

  async runPhosphobot(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if phosphobot is already running
      if (this.phosphobotProcess && !this.phosphobotProcess.killed) {
        this.log('Phosphobot is already running');
        return { success: true };
      }

      // Determine the phosphobot executable path
      const phosphobotPath =
        process.platform === 'win32'
          ? path.join(this.envPath, 'Scripts', 'phosphobot.exe')
          : path.join(this.envPath, 'bin', 'phosphobot');

      this.log(`Starting phosphobot from: ${phosphobotPath}`);

      // Spawn phosphobot process
      const enhancedEnv = this.getEnhancedEnv();
      this.phosphobotProcess = spawn(phosphobotPath, ['run'], {
        env: {
          ...enhancedEnv,
          VIRTUAL_ENV: this.envPath,
          PATH:
            process.platform === 'win32'
              ? `${path.join(this.envPath, 'Scripts')}${path.delimiter}${enhancedEnv.PATH}`
              : `${path.join(this.envPath, 'bin')}${path.delimiter}${enhancedEnv.PATH}`,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      this.phosphobotProcess.stdout?.on('data', (data) => {
        this.log(`| Phosphobot STDOUT | ${data.toString().trim()}`);
      });

      this.phosphobotProcess.stderr?.on('data', (data) => {
        this.log(`| Phosphobot STDERR | ${data.toString().trim()}`);
      });

      this.phosphobotProcess.on('error', (error) => {
        this.log(`Phosphobot process error: ${error}`);
      });

      this.phosphobotProcess.on('exit', (code, signal) => {
        this.log(
          `Phosphobot process exited with code ${code} and signal ${signal}`,
        );
        this.phosphobotProcess = null;
      });

      // Wait a bit to ensure the process started successfully
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (this.phosphobotProcess.killed) {
        throw new Error('Phosphobot process died immediately after starting');
      }

      return { success: true };
    } catch (error: any) {
      this.log(`Failed to run phosphobot: ${error}`);
      return { success: false, error: error.message };
    }
  }

  stopPhosphobot(): void {
    if (this.phosphobotProcess && !this.phosphobotProcess.killed) {
      this.log('Stopping phosphobot process');
      this.phosphobotProcess.kill();
      this.phosphobotProcess = null;
    }
  }
}
