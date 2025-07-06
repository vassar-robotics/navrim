import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import logoImg from '../../assets/logo-with-text.png';

interface EnvironmentStatus {
  uvInstalled: boolean;
  envExists: boolean;
  packageInstalled: boolean;
}

interface SetupProgress {
  checking: boolean;
  installingUv: boolean;
  creatingEnv: boolean;
  installingPackage: boolean;
  startingPhosphobot: boolean;
  waitingForService: boolean;
  serviceReady?: boolean;
  error: string;
}

function EnvironmentSetup() {
  const [status, setStatus] = useState<EnvironmentStatus | null>(null);
  const [progress, setProgress] = useState<SetupProgress>({
    checking: true,
    installingUv: false,
    creatingEnv: false,
    installingPackage: false,
    startingPhosphobot: false,
    waitingForService: false,
    error: ''
  });

  useEffect(() => {
    checkAndSetupEnvironment();
  }, []);

  const checkAndSetupEnvironment = async () => {
    try {
      // Check environment status
      setProgress(prev => ({ ...prev, checking: true }));
      const envStatus = await window.electron.ipcRenderer.invoke('env-status');
      setStatus(envStatus);
      setProgress(prev => ({ ...prev, checking: false }));

      // If environment is ready, start phosphobot
      // if (envStatus.uvInstalled && envStatus.envExists && envStatus.packageInstalled) {
      // } else {
      // If environment is not ready, set it up first
      await setupEnvironment(envStatus);
      await startPhosphobot();
      // }
    } catch (error: any) {
      setProgress(prev => ({
        ...prev,
        checking: false,
        error: error.message || 'Error checking environment'
      }));
    }
  };

  const setupEnvironment = async (envStatus: EnvironmentStatus) => {
    try {
      // Call backend's setupEnvironment method
      setProgress(prev => ({
        ...prev,
        installingUv: true,
      }));

      let result = await window.electron.ipcRenderer.invoke('install-uv');
      if (!result.success) {
        throw new Error(result.error || 'Failed to setup environment');
      }

      setProgress(prev => ({
        ...prev,
        installingUv: false,
        creatingEnv: true,
        installingPackage: false
      }));

      result = await window.electron.ipcRenderer.invoke('create-env');
      if (!result.success) {
        throw new Error(result.error || 'Failed to create virtual environment');
      }

      setProgress(prev => ({
        ...prev,
        installingUv: false,
        creatingEnv: false,
        installingPackage: true
      }));

      result = await window.electron.ipcRenderer.invoke('install-package', 'navrim-phosphobot');
      if (!result.success) {
        throw new Error(result.error || 'Failed to install navrim-phosphobot');
      }
      result = await window.electron.ipcRenderer.invoke('install-package', 'navrim-lerobot');
      if (!result.success) {
        throw new Error(result.error || 'Failed to install navrim-lerobot');
      }

      setProgress(prev => ({
        ...prev,
        installingUv: false,
        creatingEnv: false,
        installingPackage: false
      }));

      // Recheck status
      const newStatus = await window.electron.ipcRenderer.invoke('env-status');
      setStatus(newStatus);

      // If everything is ready, start phosphobot
      if (newStatus.uvInstalled && newStatus.envExists && newStatus.packageInstalled) {
        await startPhosphobot();
      }
    } catch (error: any) {
      setProgress(prev => ({
        ...prev,
        installingUv: false,
        creatingEnv: false,
        installingPackage: false,
        error: error.message || 'Error setting up environment'
      }));
    }
  };

  const checkPortAvailable = async (port: number): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:${port}`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const waitForService = async () => {
    const maxAttempts = 60; // 60 seconds max wait
    let attempts = 0;

    while (attempts < maxAttempts) {
      const isAvailable = await checkPortAvailable(80);
      if (isAvailable) {
        return true;
      }

      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    return false;
  };

  const startPhosphobot = async () => {
    try {
      setProgress(prev => ({ ...prev, startingPhosphobot: true }));
      const result = await window.electron.ipcRenderer.invoke('run-phosphobot');

      if (!result.success) {
        throw new Error(result.error || 'Failed to start phosphobot');
      }

      setProgress(prev => ({ ...prev, startingPhosphobot: false, waitingForService: true }));

      // Wait for service to be available
      const serviceReady = await waitForService();

      if (!serviceReady) {
        throw new Error('Service failed to start within 60 seconds');
      }

      setProgress(prev => ({ ...prev, waitingForService: false }));

       // Navigate to localhost:80
      window.location.href = 'http://localhost:80';
    } catch (error: any) {
      setProgress(prev => ({
        ...prev,
        startingPhosphobot: false,
        waitingForService: false,
        error: error.message || 'Error starting phosphobot'
      }));
    }
  };

  const getProgressMessage = () => {
    if (progress.checking) return 'Checking environment...';
    if (progress.installingUv) return 'Installing uv... \n(May take a while for the first time)';
    if (progress.creatingEnv) return 'Creating virtual environment...';
    if (progress.installingPackage) return 'Installing dependencies... \n(May take a while for the first time)';
    if (progress.startingPhosphobot) return 'Starting phosphobot...';
    if (progress.waitingForService) return 'Waiting for service to be ready... \n(May take a while for the first time)';
    if (progress.error) return `Error: ${progress.error}`;

    if (status) {
      if (!status.uvInstalled) return 'uv needs to be installed';
      if (!status.envExists) return 'Virtual environment needs to be created';
      if (!status.packageInstalled) return 'navrim-phosphobot and navrim-lerobot needs to be installed';
      return '';
    }

    return 'Preparing...';
  };

  const isLoading = progress.checking || progress.installingUv ||
                   progress.creatingEnv || progress.installingPackage ||
                   progress.startingPhosphobot || progress.waitingForService

  return (
    <div className="fallback-container">
      <div className="fallback-content">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <img
            src={logoImg}
            alt="Logo"
            style={{
              height: '60px',
              width: 'auto',
              maxWidth: '200px'
            }}
          />
        </div>
        <div className="fallback-icon" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '72px',
          marginBottom: '20px'
        }}>
          {isLoading || progress.error=='' ? (
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #E5E5E5',
              borderTop: '3px solid #0066CC',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
          ) : '❌'}
        </div>
        <h1 className="fallback-title">
          {isLoading || progress.error=='' ? 'Setting up environment' : 'Something went wrong'}
        </h1>
        <div className="fallback-message" style={{ 
          fontSize: '14px', 
          maxWidth: '800px', 
          maxHeight: '300px',
          overflowY: 'auto',
          textAlign: 'center',
        }}>
          {getProgressMessage().split('\n').map((line, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              {line}
            </div>
          ))}
        </div>

        <div></div>

      {progress.error && (
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '16px',
          color: '#666'
        }}>
          Need help?<br></br>Please contact us at<a href="mailto:support@navrim.com" style={{ color: '#0066CC', textDecoration: 'none' }}>support@navrim.com</a>
        </div>
      )}

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnvironmentSetup />} />
      </Routes>
    </Router>
  );
}
