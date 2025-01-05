import React, { useEffect, useState } from 'react';
import { initializeFacebookSDK } from '@/utils/facebook/FacebookSDK';
import { useFacebookLogin } from '@/hooks/useFacebookLogin';

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
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const { isProcessing, handleLogin } = useFacebookLogin();

  useEffect(() => {
    const cleanup = initializeFacebookSDK(appId, () => setIsSDKLoaded(true));
    return cleanup;
  }, [appId]);

  return (
    <button
      onClick={() => handleLogin(onSuccess, onError)}
      disabled={!isSDKLoaded || isProcessing}
      className={`
        flex items-center justify-center gap-2 
        w-full max-w-sm
        px-4 py-2 rounded
        ${isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1877F2] hover:bg-[#166FE5]'}
        text-white font-semibold text-base
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
      type="button"
      aria-busy={isProcessing}
    >
      <svg
        className="w-5 h-5 fill-current"
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      <span>
        {isProcessing ? 'Processing...' : isReconnect ? 'Reconnect Facebook' : 'Continue with Facebook'}
      </span>
    </button>
  );
};

export default FacebookLoginButton;