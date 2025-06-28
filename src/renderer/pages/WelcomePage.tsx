import { useState, useEffect } from 'react';

interface Step {
  id: number;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  subStep?: string;
}

export default function WelcomePage() {
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, label: 'Initializing', status: 'pending' },
    { id: 2, label: 'Setting up workspace', status: 'pending' },
    { id: 3, label: 'Almost ready', status: 'pending' },
  ]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const simulateSetup = async () => {
      try {
        // Sub-steps for initializing
        const initSubSteps = [
          'installing uv',
          'installing phosphobot',
          'installing lerobot'
        ];

        // Handle the initializing step with sub-steps
        setSteps(prevSteps =>
          prevSteps.map((step) => ({
            ...step,
            status: step.id === 1 ? 'in-progress' : 'pending'
          }))
        );

        // Simulate each sub-step
        for (const subStep of initSubSteps) {
          setSteps(prevSteps =>
            prevSteps.map((step) => ({
              ...step,
              subStep: step.id === 1 ? subStep : undefined
            }))
          );

          // Simulate a random failure (10% chance)
          if (Math.random() < 0.1) {
            throw new Error(`Failed to complete: ${subStep}`);
          }

          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Complete the initializing step
        setSteps(prevSteps =>
          prevSteps.map((step) => ({
            ...step,
            status: step.id === 1 ? 'completed' : 'pending',
            subStep: undefined
          }))
        );

        // Continue with remaining steps
        for (let i = 1; i < steps.length; i++) {
          setSteps(prevSteps =>
            prevSteps.map((step, index) => ({
              ...step,
              status: index < i ? 'completed' : index === i ? 'in-progress' : 'pending'
            }))
          );

          // Simulate a random failure (10% chance)
          if (Math.random() < 0.1) {
            throw new Error(`Failed at step: ${steps[i].label}`);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));

          setSteps(prevSteps =>
            prevSteps.map((step, index) => ({
              ...step,
              status: index <= i ? 'completed' : 'pending'
            }))
          );
        }

        setIsReady(true);
      } catch (err) {
        // Mark the current in-progress step as failed
        setSteps(prevSteps =>
          prevSteps.map((step) => ({
            ...step,
            status: step.status === 'in-progress' ? 'failed' : step.status,
            subStep: step.status === 'in-progress' ? undefined : step.subStep
          }))
        );

        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    simulateSetup();
  }, []);

  const handleEnter = () => {
    window.electron?.navigateTo('http://localhost:80');
  };

  const getStatusEmoji = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '⏩';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
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
          <h1 className="text-xl font-normal text-gray-900">Welcome to Navrim</h1>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-8">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center text-sm">
              <span
                className={`mr-3 font-mono ${
                  step.status === 'completed'
                    ? 'text-gray-900'
                    : step.status === 'in-progress'
                    ? 'text-gray-600 animate-pulse'
                    : step.status === 'failed'
                    ? 'text-red-500'
                    : 'text-gray-300'
                }`}
              >
                {getStatusEmoji(step.status)}
              </span>
              <span className={
                step.status === 'completed'
                  ? 'text-gray-700'
                  : step.status === 'in-progress'
                  ? 'text-gray-600'
                  : step.status === 'failed'
                  ? 'text-red-500'
                  : 'text-gray-400'
              }>
                {step.label}
                {step.subStep && (
                  <span className="text-gray-500">: {step.subStep}</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleEnter}
          disabled={!isReady || error !== null}
          className={`w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
            isReady && !error
              ? 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isReady ? 'Continue →' : 'Please wait...'}
        </button>

        {/* Error Message */}
        {error && (
          <p className="mt-3 text-sm text-red-600 text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
