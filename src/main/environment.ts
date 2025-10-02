import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { app } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import { kill } from 'process';

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

    this.log(`Installing UV package manager...`);
    this.log(`This is a one-time setup that may take a few minutes...`);
    this.log(`Command: ${installCommand}`);

    try {
      // For UV installation, we'll stick with execAsync but add progress messages
      this.log(`Downloading UV installer...`);

      const { stdout, stderr } = await execAsync(installCommand, {
        shell: true,
        env: this.getEnhancedEnv(),
      } as any);

      if (stderr && !stderr.includes('warning')) {
        this.log(`UV installation output: ${stderr}`);
      }

      if (stdout) {
        // Parse and show relevant parts of the output
        const lines = stdout.split('\n').filter((line) => line.trim());
        for (const line of lines) {
          if (
            line.includes('Installing') ||
            line.includes('Downloading') ||
            line.includes('Success') ||
            line.includes('Complete')
          ) {
            this.log(`  ${line.trim()}`);
          }
        }
      }

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

      // Create virtual environment with Python 3.10
      this.log(`Creating virtual environment...`);
      this.log(`This may take a few moments...`);

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

      this.log(`✓ Virtual environment created successfully`);
    } catch (error: any) {
      this.log(`Failed to create virtual environment: ${error}`);
      throw new Error(`Failed to create virtual environment: ${error.message}`);
    }
  }

  async installPackage(
    packageName: string = 'navrim-phosphobot',
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.log(`Installing package: ${packageName}`);
        this.log(`This may take several minutes, please wait...`);

        // Use spawn for real-time output streaming
        const args = ['pip', 'install', '-U', packageName, '-v']; // Added -v for verbose output

        this.log(`Running: uv ${args.join(' ')}`);

        const uvProcess = spawn('uv', args, {
          shell: true,
          env: {
            ...this.getEnhancedEnv(),
            VIRTUAL_ENV: this.envPath,
            UV_PROJECT_ENVIRONMENT: this.envPath,
          },
        });

        let hasError = false;
        let errorMessage = '';

        uvProcess.stdout?.on('data', (data) => {
          const output = data.toString().trim();
          if (output) {
            // Filter and format output for better readability
            const lines = output.split('\n');
            for (const line of lines) {
              if (
                line.includes('Downloading') ||
                line.includes('Installing') ||
                line.includes('Successfully') ||
                line.includes('Collecting') ||
                line.includes('Requirement') ||
                line.includes('Using cached') ||
                line.includes('Processing') ||
                line.includes('%') || // Progress percentages
                line.includes('━') || // Progress bars
                line.includes('•')
              ) {
                // Status indicators
                this.log(`  ${line}`);
              }
            }
          }
        });

        uvProcess.stderr?.on('data', (data) => {
          const stderr = data.toString().trim();
          if (stderr && !stderr.includes('warning')) {
            this.log(`  ⚠️ ${stderr}`);
            if (stderr.includes('error') || stderr.includes('Error')) {
              hasError = true;
              errorMessage += stderr + '\n';
            }
          }
        });

        uvProcess.on('error', (error) => {
          this.log(`Failed to start package installation: ${error.message}`);
          reject(new Error(`Failed to install package: ${error.message}`));
        });

        uvProcess.on('close', async (code) => {
          if (code === 0 && !hasError) {
            this.log(`✓ Successfully installed ${packageName}`);
            try {
              await this.checkPackageVersion(packageName);
              resolve();
            } catch (error) {
              reject(error);
            }
          } else {
            const message = `Package installation failed with code ${code}${errorMessage ? ': ' + errorMessage : ''}`;
            this.log(`✗ ${message}`);
            reject(new Error(message));
          }
        });
      } catch (error: any) {
        this.log(`Failed to install package: ${error}`);
        reject(new Error(`Failed to install package: ${error.message}`));
      }
    });
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
      this.phosphobotProcess = spawn(phosphobotPath, ['run', '--port', '8080'], {
        env: {
          ...enhancedEnv,
          VIRTUAL_ENV: this.envPath,
          PATH:
            process.platform === 'win32'
              ? `${path.join(this.envPath, 'Scripts')}${path.delimiter}${enhancedEnv.PATH}`
              : `${path.join(this.envPath, 'bin')}${path.delimiter}${enhancedEnv.PATH}`,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        // On Unix-like systems, use process groups for better process tree management
        ...(process.platform !== 'win32' ? { detached: false } : {}),
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

  /**
   * Kill process tree to ensure all child processes are terminated
   */
  private async killProcessTree(pid: number): Promise<void> {
    try {
      if (process.platform === 'win32') {
        // On Windows, use taskkill to terminate process tree
        await execAsync(`taskkill /pid ${pid} /T /F`);
      } else {
        // On Unix-like systems, kill the process group
        try {
          // Try to get child processes first
          const { stdout } = await execAsync(`pgrep -P ${pid}`);
          const childPids = stdout.trim().split('\n').filter(p => p);

          // Kill children first
          for (const childPid of childPids) {
            try {
              kill(parseInt(childPid), 'SIGKILL');
            } catch (e) {
              // Process might already be dead
            }
          }
        } catch (e) {
          // No children or pgrep failed, continue
        }

        // Finally kill the main process
        try {
          kill(pid, 'SIGKILL');
        } catch (e) {
          // Process might already be dead
        }
      }
    } catch (error) {
      this.log(`Error killing process tree: ${error}`);
    }
  }

  stopPhosphobot(): void {
    if (this.phosphobotProcess && !this.phosphobotProcess.killed) {
      const pid = this.phosphobotProcess.pid;
      this.log(`Stopping phosphobot process (PID: ${pid}) gracefully`);

      // Try graceful shutdown first with SIGTERM
      try {
        this.phosphobotProcess.kill('SIGTERM');
      } catch (error) {
        this.log(`Error sending SIGTERM: ${error}`);
      }

      // Set a timeout to force kill if process doesn't terminate within 5 seconds
      const forceKillTimeout = setTimeout(async () => {
        if (this.phosphobotProcess && !this.phosphobotProcess.killed && pid) {
          this.log('Phosphobot did not terminate gracefully, forcing kill of entire process tree');
          try {
            await this.killProcessTree(pid);
          } catch (error) {
            this.log(`Error force killing phosphobot tree: ${error}`);
          }
          this.phosphobotProcess = null;
        }
      }, 5000);

      // Clear timeout when process exits naturally
      this.phosphobotProcess.once('exit', () => {
        clearTimeout(forceKillTimeout);
        this.phosphobotProcess = null;
      });
    }
  }
}
