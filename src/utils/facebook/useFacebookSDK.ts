import { useState, useEffect, useCallback } from 'react';
import { FacebookSDK } from './FacebookSDK';

export const useFacebookSDK = (appId: string) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const initializeSDK = useCallback(async () => {
    try {
      const sdk = FacebookSDK.getInstance();
      await sdk.initialize(appId);
      console.log('Facebook SDK initialized successfully');
      setIsSDKLoaded(true);
      setInitError(null);
    } catch (error) {
      console.error('Failed to initialize Facebook SDK:', error);
      setInitError('Failed to initialize Facebook SDK');
      setIsSDKLoaded(false);
    }
  }, [appId]);

  useEffect(() => {
    const sdk = FacebookSDK.getInstance();
    let mounted = true;

    const init = async () => {
      if (mounted) {
        await initializeSDK();
      }
    };

    init();

    return () => {
      mounted = false;
      sdk.cleanup();
    };
  }, [initializeSDK]);

  const reinitialize = async () => {
    setIsSDKLoaded(false);
    setInitError(null);
    await initializeSDK();
  };

  return { isSDKLoaded, initError, reinitialize };
};