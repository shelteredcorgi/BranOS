import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppProps, LocalLauncherInitialData } from "@/apps/base/types";

interface LaunchStatus {
  status: 'idle' | 'launching' | 'success' | 'error';
  message?: string;
}

export const LocalLauncherAppComponent: React.FC<AppProps<LocalLauncherInitialData>> = ({
  initialData,
  onClose,
}) => {
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>({ status: 'idle' });

  const handleLaunch = async () => {
    if (!initialData?.pythonScript) {
      setLaunchStatus({
        status: 'error',
        message: 'No script configured for this app'
      });
      return;
    }

    setLaunchStatus({ status: 'launching', message: 'Launching application...' });

    try {
      const response = await fetch('/api/launch-local-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptPath: initialData.pythonScript,
          appName: initialData.appName,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setLaunchStatus({
          status: 'success',
          message: result.message || 'Application launched successfully!'
        });
      } else {
        setLaunchStatus({
          status: 'error',
          message: result.error || 'Failed to launch application'
        });
      }
    } catch {
      setLaunchStatus({
        status: 'error',
        message: 'Network error: Could not connect to launch service'
      });
    }
  };

  const getStatusColor = () => {
    switch (launchStatus.status) {
      case 'launching': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (launchStatus.status) {
      case 'launching': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '🚀';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto">
          <img 
            src={initialData?.appIcon || '/icons/default/applications.png'} 
            alt={initialData?.appName || 'App'} 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData?.appName || 'Local Application'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {initialData?.appDescription || 'Launch a local application'}
          </p>
        </div>
      </div>

      <div className="space-y-4 w-full max-w-xs">
        <Button
          onClick={handleLaunch}
          disabled={launchStatus.status === 'launching'}
          className="w-full"
          size="lg"
        >
          {launchStatus.status === 'launching' ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Launching...
            </>
          ) : (
            <>
              🚀 Launch {initialData?.appName || 'App'}
            </>
          )}
        </Button>

        {launchStatus.message && (
          <div className={`text-center text-sm ${getStatusColor()} bg-gray-50 p-3 rounded-md`}>
            <span className="mr-2">{getStatusIcon()}</span>
            {launchStatus.message}
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
          {launchStatus.status !== 'idle' && (
            <Button
              onClick={() => setLaunchStatus({ status: 'idle' })}
              variant="outline"
              className="flex-1"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {initialData?.pythonScript && (
        <div className="text-xs text-gray-400 text-center max-w-sm">
          Script: {initialData.pythonScript}
        </div>
      )}
    </div>
  );
};