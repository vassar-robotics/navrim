import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

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
  error?: string;
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
      if (envStatus.uvInstalled && envStatus.envExists && envStatus.packageInstalled) {
        await startPhosphobot();
      } else {
        // If environment is not ready, set it up first
        await setupEnvironment(envStatus);
      }
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
        installingUv: !envStatus.uvInstalled,
        creatingEnv: !envStatus.envExists,
        installingPackage: !envStatus.packageInstalled
      }));
      
      const result = await window.electron.ipcRenderer.invoke('setup-environment');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to setup environment');
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
    if (progress.installingUv) return 'Installing uv...';
    if (progress.creatingEnv) return 'Creating virtual environment...';
    if (progress.installingPackage) return 'Installing dependencies...';
    if (progress.startingPhosphobot) return 'Starting phosphobot...';
    if (progress.waitingForService) return 'Waiting for service to be ready...';
    if (progress.error) return `Error: ${progress.error}`;
    
    if (status) {
      if (!status.uvInstalled) return 'uv needs to be installed';
      if (!status.envExists) return 'Virtual environment needs to be created';
      if (!status.packageInstalled) return 'navrim-phosphobot and navrim-lerobot needs to be installed';
      return 'Environment is ready';
    }
    
    return 'Preparing...';
  };

  const isLoading = progress.checking || progress.installingUv || 
                   progress.creatingEnv || progress.installingPackage || 
                   progress.startingPhosphobot || progress.waitingForService;

  return (
    <div className="fallback-container">
      <div className="fallback-content">
        <div className="fallback-icon" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '72px',
          marginBottom: '20px'
        }}>
          {isLoading ? (
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #E5E5E5',
              borderTop: '3px solid #0066CC',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
          ) : (progress.error ? '❌' : '⚠️')}
        </div>
        <h1 className="fallback-title">
          {isLoading ? 'Setting up environment' : (progress.error ? 'Something went wrong' : 'Environment not ready')}
        </h1>
        <p className="fallback-message">
          {getProgressMessage()}
        </p>
        
        {/* Show detailed status */}
        {status && !isLoading && !progress.error && (
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#787774' }}>
            <div>UV: {status.uvInstalled ? '✅ Installed' : '❌ Not installed'}</div>
            <div>Virtual Environment: {status.envExists ? '✅ Created' : '❌ Not created'}</div>
            <div>navrim-phosphobot and navrim-lerobot: {status.packageInstalled ? '✅ Installed' : '❌ Not installed'}</div>
          </div>
        )}

        {/* Show retry button on error */}
        {progress.error && (
          <button 
            onClick={checkAndSetupEnvironment}
            style={{ marginTop: '20px' }}
          >
            Retry
          </button>
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
