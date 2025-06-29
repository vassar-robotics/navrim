import { useEffect, useState } from "react";
import {
  BackendStatus,
  InstallationProgress,
  IPCChannels,
  PortCheckResult,
} from "../../types/ipc.ts";

interface Step {
  id: number;
  label: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  subStep?: string;
}

export default function WelcomePage() {
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, label: "Initializing", status: "pending" },
    { id: 2, label: "Setting up workspace", status: "pending" },
    { id: 3, label: "Almost ready", status: "pending" },
  ]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatuses, setBackendStatuses] = useState({
    uv: false,
    phosphobot: false,
    lerobot: false,
  });

  useEffect(() => {
    // Set up progress listener
    const removeListener = window.electron.ipcRenderer.on(
      IPCChannels.INSTALLATION_PROGRESS,
      (...args: unknown[]) => {
        const progress = args[0] as InstallationProgress;
        console.log("Installation progress:", progress);

        // Update sub-step during installation
        if (progress.status === "installing") {
          const subStepText = progress.type === "uv"
            ? "installing uv"
            : progress.type === "phosphobot"
            ? "installing phosphobot"
            : "installing lerobot";

          setSteps((prevSteps) =>
            prevSteps.map((step) => ({
              ...step,
              subStep: step.id === 1 ? subStepText : undefined,
            }))
          );
        }

        // Handle individual backend completion/failure
        if (progress.status === "completed" || progress.status === "failed") {
          if (progress.status === "failed") {
            setError(progress.message);
            setSteps((prevSteps) =>
              prevSteps.map((step) => ({
                ...step,
                status: step.id === 1 ? "failed" : step.status,
                subStep: undefined,
              }))
            );
          } else {
            // Update backend status
            setBackendStatuses((prev) => ({
              ...prev,
              [progress.type]: true,
            }));
          }
        }
      },
    );

    const performSetup = async () => {
      try {
        // Start initialization step
        setSteps((prevSteps) =>
          prevSteps.map((step) => ({
            ...step,
            status: step.id === 1 ? "in-progress" : "pending",
          }))
        );

        // Install uv first (required for other installations)
        const uvResult: BackendStatus = await window.electron.ipcRenderer.invoke(
          IPCChannels.INSTALL_UV,
        );

        if (!uvResult.success) {
          setError(`Failed to install uv: ${uvResult.message}`);
          return;
        }

        // Install phosphobot
        const phosphobotResult: BackendStatus = await window.electron.ipcRenderer.invoke(
          IPCChannels.INSTALL_PHOSPHOBOT,
        );

        if (!phosphobotResult.success) {
          setError(`Failed to install phosphobot: ${phosphobotResult.message}`);
          return;
        }

        // Install lerobot
        const lerobotResult: BackendStatus = await window.electron.ipcRenderer.invoke(
          IPCChannels.INSTALL_LEROBOT,
        );

        if (!lerobotResult.success) {
          setError(`Failed to install lerobot: ${lerobotResult.message}`);
          return;
        }

        // All backends installed successfully
        setSteps((prevSteps) =>
          prevSteps.map((step) => ({
            ...step,
            status: step.id === 1 ? "completed" : step.status,
            subStep: undefined,
          }))
        );

        // Continue with remaining setup steps
        completeRemainingSteps();

      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
        setSteps((prevSteps) =>
          prevSteps.map((step) => ({
            ...step,
            status: step.status === "in-progress" ? "failed" : step.status,
            subStep: undefined,
          }))
        );
      }
    };

    const completeRemainingSteps = async () => {
      // Step 2: Setting up workspace - Launch backend and wait for it to be ready
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          status: step.id === 1
            ? "completed"
            : step.id === 2
            ? "in-progress"
            : "pending",
          subStep: step.id === 2 ? "launching backend" : undefined,
        }))
      );

      // Launch the backend
      const launchResult: BackendStatus = await window.electron.ipcRenderer.invoke(
        IPCChannels.LAUNCH_BACKEND,
      );

      if (!launchResult.success) {
        setError(`Failed to launch backend: ${launchResult.message}`);
        setSteps((prevSteps) =>
          prevSteps.map((step) => ({
            ...step,
            status: step.id === 2 ? "failed" : step.status,
            subStep: undefined,
          }))
        );
        return;
      }

      // Update substep to show we're waiting for the service
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          subStep: step.id === 2 ? "waiting for service on port 80" : undefined,
        }))
      );

      // Wait for port 80 to be ready (max 30 seconds)
      const maxWaitTime = 30000; // 30 seconds
      const checkInterval = 1000; // Check every second
      const startTime = Date.now();
      let isPortReady = false;

      while (!isPortReady && (Date.now() - startTime) < maxWaitTime) {
        const portCheck: PortCheckResult = await window.electron.ipcRenderer.invoke(
          IPCChannels.CHECK_PORT,
          80
        );

        if (portCheck.isReady) {
          isPortReady = true;
          break;
        }

        // Wait before checking again
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
      }

      if (!isPortReady) {
        setError("Backend service failed to start on port 80");
        setSteps((prevSteps) =>
          prevSteps.map((step) => ({
            ...step,
            status: step.id === 2 ? "failed" : step.status,
            subStep: undefined,
          }))
        );
        return;
      }

      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          status: step.id <= 2 ? "completed" : "pending",
          subStep: undefined,
        }))
      );

      // Step 3: Almost ready
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          status: step.id <= 2 ? "completed" : "in-progress",
        }))
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          status: "completed",
        }))
      );

      setIsReady(true);
    };

    performSetup();

    // Cleanup listener on unmount
    return () => {
      removeListener();
    };
  }, []);

  const handleEnter = () => {
    window.electron?.ipcRenderer.sendMessage(
      IPCChannels.NAVIGATE_TO,
      "http://localhost:80",
    );
  };

  const getStatusEmoji = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return "✅";
      case "in-progress":
        return "⏩";
      case "pending":
        return "⏳";
      case "failed":
        return "❌";
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 shadow-sm overflow-hidden">
            <img
              src="https://static.vecteezy.com/system/resources/previews/020/878/844/non_2x/robotics-icon-style-free-vector.jpg" // TODO: Replace with actual logo
              alt="Navrim"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-normal text-gray-900">
            Welcome to Navrim
          </h1>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-8">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center text-sm">
              <span
                className={`mr-3 font-mono ${
                  step.status === "completed"
                    ? "text-gray-900"
                    : step.status === "in-progress"
                    ? "text-gray-600 animate-pulse"
                    : step.status === "failed"
                    ? "text-red-500"
                    : "text-gray-300"
                }`}
              >
                {getStatusEmoji(step.status)}
              </span>
              <span
                className={step.status === "completed"
                  ? "text-gray-700"
                  : step.status === "in-progress"
                  ? "text-gray-600"
                  : step.status === "failed"
                  ? "text-red-500"
                  : "text-gray-400"}
              >
                {step.label}
                {step.subStep && (
                  <span className="text-gray-500">: {step.subStep}</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {!error
          ? (
            <button
              onClick={handleEnter}
              disabled={!isReady}
              className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                isReady
                  ? "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isReady ? "Continue →" : "Please wait..."}
            </button>
          )
          : (
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700"
              >
                Retry Installation
              </button>
              <button
                onClick={handleEnter}
                className="w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Skip and Continue →
              </button>
            </div>
          )}

        {/* Error Message */}
        {error && (
          <p className="mt-3 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        {/* Dev Mode Skip (only in development) */}
        {process.env.NODE_ENV === "development" && !isReady && !error && (
          <button
            onClick={handleEnter}
            className="mt-2 w-full py-2 px-4 rounded-md text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            Skip installation (dev mode)
          </button>
        )}
      </div>
    </div>
  );
}
