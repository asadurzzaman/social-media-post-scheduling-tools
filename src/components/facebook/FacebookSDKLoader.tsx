import { useEffect } from 'react';

interface FacebookSDKLoaderProps {
  appId: string;
  onLoad: () => void;
}

export const FacebookSDKLoader = ({ appId, onLoad }: FacebookSDKLoaderProps) => {
  useEffect(() => {
    const loadFacebookSDK = () => {
      console.info('Starting Facebook SDK initialization...');
      
      // Remove any existing FB SDK
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
        delete window.FB;
      }

      // Create new script element
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v19.0'
        });
        
        console.info('Facebook SDK initialized successfully');
        onLoad();
      };

      script.onerror = (error) => {
        console.error('Error loading Facebook SDK:', error);
      };

      // Insert the script element
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode?.insertBefore(script, firstScript);
    };

    loadFacebookSDK();

    // Cleanup function
    return () => {
      const script = document.getElementById('facebook-jssdk');
      if (script) {
        script.remove();
        delete window.FB;
      }
    };
  }, [appId, onLoad]);

  return null;
};