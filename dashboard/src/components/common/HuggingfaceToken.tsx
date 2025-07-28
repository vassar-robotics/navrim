import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import toast from 'react-hot-toast';
import {
  faTrash,
  faPlugCircleCheck,
  faCircleInfo,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

const HuggingfaceToken: React.FC = () => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSaveToken = async () => {
    const saveToken = async () => {
      // TODO: Implement actual save logic to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      return 'Token saved';
    };

    toast.promise(
      saveToken(),
      {
        loading: 'Saving token...',
        success: <b>Token saved successfully!</b>,
        error: <b>Failed to save token!</b>,
      }
    );
  };

  const handleDeleteToken = async () => {
    if (window.confirm('Are you sure you want to delete the Hugging Face token?')) {
      const deleteToken = async () => {
        // TODO: Implement actual delete logic
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        setToken('');
        return 'Token deleted';
      };

      toast.promise(
        deleteToken(),
        {
          loading: 'Deleting token...',
          success: <b>Token deleted successfully!</b>,
          error: <b>Failed to delete token!</b>,
        }
      );
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    
    const testConnection = async () => {
      // TODO: Implement actual token verification
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      return 'Token verified';
    };

    toast.promise(
      testConnection(),
      {
        loading: 'Verifying token...',
        success: <b>Token verified!</b>,
        error: <b>Token verification failed!</b>,
      }
    ).finally(() => {
      setIsTesting(false);
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    handleSaveToken();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Hugging Face Token</h3>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <FontAwesomeIcon icon={faCircleInfo} className="w-4 h-4 text-gray-400 mt-0.5" />
          <p>
            Go to{' '}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Hugging Face settings page
            </a>{' '}
            and create a token with <strong>Write access to content/settings</strong> for syncing datasets and models.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none text-sm transition-colors ${isFocused ? 'border-gray-900' : 'border-gray-300'
                }`}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={showToken ? faEyeSlash : faEye} className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={!token || isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faPlugCircleCheck} className="w-4 h-4" />
            <span className="hidden sm:inline">{isTesting ? 'Verifying...' : 'Verify token'}</span>
          </button>

          <button
            onClick={handleDeleteToken}
            disabled={!token}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HuggingfaceToken;
