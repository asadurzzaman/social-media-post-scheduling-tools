import { useState, useEffect } from 'react';
import { FacebookSDK } from './FacebookSDK';

export const useFacebookSDK = (appId: string) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const sdk = FacebookSDK.getInstance();
    let mounted = true;

    const initializeSDK = async () => {
      try {
        await sdk.initialize(appId);
        if (mounted) {
          console.log('Facebook SDK initialized successfully');
          setIsSDKLoaded(true);
          setInitError(null);
        }
      } catch (error) {
        console.error('Failed to initialize Facebook SDK:', error);
        if (mounted) {
          setInitError('Failed to initialize Facebook SDK');
          setIsSDKLoaded(false);
        }
      }
    };

    initializeSDK();

    return () => {
      mounted = false;
      sdk.cleanup();
    };
  }, [appId]);

  return { isSDKLoaded, initError };
};