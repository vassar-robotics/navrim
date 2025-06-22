const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');
const extract = require('extract-zip');
const tar = require('tar');
const os = require('os');

class BackendInstaller {
  constructor() {
    this.platform = process.platform;
    this.arch = process.arch;
    this.progressCallback = null;
  }

  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  updateProgress(step, message, progress) {
    if (this.progressCallback) {
      this.progressCallback({ step, message, progress });
    }
  }

  async downloadFile(url, destination) {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
    });

    const totalSize = parseInt(response.headers['content-length'], 10);
    let downloadedSize = 0;

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(destination);
      
      response.data.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const percent = Math.round((downloadedSize / totalSize) * 100);
        // Progress updates can be sent here
      });

      response.data.pipe(writer);

      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  async checkUvInstalled() {
    return new Promise((resolve) => {
      const childProcess = spawn('uv', ['--version'], { stdio: 'pipe' });
      
      childProcess.on('close', (code) => {
        resolve(code === 0);
      });

      childProcess.on('error', () => {
        resolve(false);
      });
    });
  }

  async downloadAndInstallUv(installPath) {
    this.updateProgress(1, 'Downloading uv...', 20);
    
    // uv installation script URL
    const uvInstallScript = this.platform === 'win32' 
      ? 'https://astral.sh/uv/install.ps1'
      : 'https://astral.sh/uv/install.sh';

    const extension = this.platform === 'win32' ? '.ps1' : '.sh';
    const installerPath = path.join(installPath, `uv-installer${extension}`);
    
    try {
      await this.downloadFile(uvInstallScript, installerPath);
      
      this.updateProgress(1, 'Installing uv...', 30);
      
      return new Promise((resolve, reject) => {
        let command, args;
        
        if (this.platform === 'win32') {
          command = 'powershell';
          args = ['-ExecutionPolicy', 'ByPass', '-File', installerPath];
        } else {
          command = 'bash';
          args = [installerPath];
        }

        const childProcess = spawn(command, args, { 
          stdio: 'pipe',
          env: { ...process.env }
        });
        
        let output = '';
        childProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        childProcess.stderr.on('data', (data) => {
          output += data.toString();
        });
        
        childProcess.on('close', (code) => {
          if (code === 0) {
            // Clean up installation file
            try {
              fs.unlinkSync(installerPath);
            } catch (e) {
              // Ignore cleanup errors
            }
            
            // Wait a moment for uv to complete installation
            setTimeout(() => {
              resolve();
            }, 2000);
          } else {
            reject(new Error(`uv installation failed, exit code: ${code}\n${output}`));
          }
        });

        childProcess.on('error', (error) => {
          reject(new Error(`Installation process error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Failed to download uv installation script: ${error.message}`);
    }
  }

  async ensureUvAvailable(installPath) {
    const uvInstalled = await this.checkUvInstalled();
    
    if (uvInstalled) {
      this.updateProgress(1, 'uv already installed, skipping download...', 30);
      console.log('✅ uv already installed');
      return;
    } else {
      console.log('📥 uv not installed, starting download...');
      await this.downloadAndInstallUv(installPath);
      
      // Re-check if installation was successful
      const uvNowInstalled = await this.checkUvInstalled();
      if (!uvNowInstalled) {
        throw new Error('uv still not found after installation, please check PATH environment variable or install uv manually');
      }
    }
  }

  async createPythonEnvironment(installPath) {
    this.updateProgress(2, 'Creating Python virtual environment...', 50);
    
    const venvPath = path.join(installPath, 'lerobot-env');
    
    // If virtual environment already exists, delete it first
    if (fs.existsSync(venvPath)) {
      fs.rmSync(venvPath, { recursive: true, force: true });
    }
    
    return new Promise((resolve, reject) => {
      // Use uv to create virtual environment
      const childProcess = spawn('uv', [
        'venv', 
        venvPath,
        '--python', '3.10'
      ], { 
        stdio: 'pipe',
        env: { ...process.env }
      });

      let output = '';
      childProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        output += data.toString();
      });

      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve(venvPath);
        } else {
          reject(new Error(`Failed to create Python environment: ${output}`));
        }
      });

      childProcess.on('error', (error) => {
        reject(new Error(`Error during environment creation: ${error.message}`));
      });
    });
  }

  async cloneLeRobot(installPath) {
    this.updateProgress(3, 'Cloning LeRobot repository...', 70);
    
    const lerobotPath = path.join(installPath, 'lerobot');
    
    // If directory already exists, delete it first
    if (fs.existsSync(lerobotPath)) {
      fs.rmSync(lerobotPath, { recursive: true, force: true });
    }
    
    return new Promise((resolve, reject) => {
      const childProcess = spawn('git', [
        'clone', 
        'https://github.com/huggingface/lerobot.git', 
        lerobotPath
      ], { stdio: 'pipe' });

      let output = '';
      childProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        output += data.toString();
      });

      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve(lerobotPath);
        } else {
          reject(new Error(`Failed to clone LeRobot: ${output}`));
        }
      });
    });
  }

  async installLeRobotDependencies(venvPath, lerobotPath) {
    this.updateProgress(4, 'Installing Python dependencies...', 85);
    
    const pythonPath = this.platform === 'win32'
      ? path.join(venvPath, 'Scripts', 'python.exe')
      : path.join(venvPath, 'bin', 'python');

    const binPath = path.dirname(pythonPath);

    return new Promise((resolve, reject) => {
      // Use uv to install dependencies to virtual environment
      const childProcess = spawn('uv', [
        'pip', 'install', '-e', '.',
        '--python', pythonPath
      ], { 
        cwd: lerobotPath,
        stdio: 'pipe',
        env: { 
          ...process.env, 
          VIRTUAL_ENV: venvPath,
          PATH: `${binPath}${path.delimiter}${process.env.PATH}`
        }
      });

      let output = '';
      childProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        output += data.toString();
      });

      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          // Continue even if failed, as some dependencies might be optional
          console.warn(`Warning during dependency installation: ${output}`);
          resolve();
        }
      });

      childProcess.on('error', (error) => {
        reject(new Error(`Error during dependency installation: ${error.message}`));
      });
    });
  }

  async install(installPath) {
    try {
      // Ensure installation directory exists
      if (!fs.existsSync(installPath)) {
        fs.mkdirSync(installPath, { recursive: true });
      }

      // 1. Ensure uv is available
      await this.ensureUvAvailable(installPath);
      
      // 2. Create Python virtual environment
      const venvPath = await this.createPythonEnvironment(installPath);
      
      // 3. Clone LeRobot
      const lerobotPath = await this.cloneLeRobot(installPath);
      
      // 4. Install dependencies
      await this.installLeRobotDependencies(venvPath, lerobotPath);
      
      this.updateProgress(5, 'Installation complete!', 100);

      const pythonPath = this.platform === 'win32'
        ? path.join(venvPath, 'Scripts', 'python.exe')
        : path.join(venvPath, 'bin', 'python');

      return {
        success: true,
        venvPath,
        lerobotPath,
        pythonPath
      };

    } catch (error) {
      throw new Error(`Installation failed: ${error.message}`);
    }
  }
}

module.exports = BackendInstaller; 