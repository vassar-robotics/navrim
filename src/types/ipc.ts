// IPC Channel names for backend installation
export const IPCChannels = {
  INSTALL_UV: 'install-uv',
  INSTALL_PHOSPHOBOT: 'install-phosphobot',
  INSTALL_LEROBOT: 'install-lerobot',
  INSTALLATION_PROGRESS: 'installation-progress',
  NAVIGATE_TO: 'navigate-to',
  LAUNCH_BACKEND: 'launch-backend',
  CHECK_PORT: 'check-port'
} as const;

// Backend installation status
export interface BackendStatus {
  success: boolean;
  message: string;
}

// Installation progress event types
export type InstallationType = 'uv' | 'phosphobot' | 'lerobot';
export type InstallationStatus = 'installing' | 'completed' | 'failed';

// Progress event data
export interface InstallationProgress {
  type: InstallationType;
  status: InstallationStatus;
  message: string;
}

// Port check result
export interface PortCheckResult {
  isReady: boolean;
  message?: string;
}

// IPC Handler type definitions
export interface IpcMainInvokeHandlers {
  [IPCChannels.INSTALL_UV]: () => Promise<BackendStatus>;
  [IPCChannels.INSTALL_PHOSPHOBOT]: () => Promise<BackendStatus>;
  [IPCChannels.INSTALL_LEROBOT]: () => Promise<BackendStatus>;
  [IPCChannels.LAUNCH_BACKEND]: () => Promise<BackendStatus>;
  [IPCChannels.CHECK_PORT]: (port: number) => Promise<PortCheckResult>;
}

// IPC Event type definitions
export interface IpcMainEvents {
  [IPCChannels.NAVIGATE_TO]: (destination: string) => void;
}

export interface IpcRendererEvents {
  [IPCChannels.INSTALLATION_PROGRESS]: (progress: InstallationProgress) => void;
}
