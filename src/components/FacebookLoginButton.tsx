import React, { useState, useEffect } from 'react';
import { FacebookLoginService } from '@/utils/facebook/FacebookLoginService';
import { FacebookSDKInitializer } from '@/utils/facebook/FacebookSDKInitializer';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FacebookLoginButtonProps {
  appId: string;
  onSuccess: (response: { accessToken: string; userId: string }) => void;
  onError: (error: string) => void;
  isReconnect?: boolean;
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  appId,
  onSuccess,
  onError,
  isReconnect = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize SDK when component mounts
    FacebookSDKInitializer.initialize(appId).catch((error) => {
      console.error('Failed to initialize Facebook SDK:', error);
      toast.error('Failed to initialize Facebook SDK');
    });

    // Cleanup when component unmounts
    return () => {
      FacebookSDKInitializer.cleanup();
    };
  }, [appId]);

  const handleFacebookLogin = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await FacebookLoginService.login(appId);
      onSuccess(response);
    } catch (error: any) {
      console.error('Facebook login error:', error);
      onError(error.message);
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={isProcessing}
      className={`
        flex items-center justify-center gap-2 
        px-4 py-2 rounded
        ${isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
        text-white font-medium
        transition-colors
        w-full max-w-sm
      `}
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <svg
          className="w-5 h-5 fill-current"
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}
      {isProcessing ? 'Processing...' : isReconnect ? 'Reconnect Facebook' : 'Continue with Facebook'}
    </button>
  );
};

export default FacebookLoginButton;