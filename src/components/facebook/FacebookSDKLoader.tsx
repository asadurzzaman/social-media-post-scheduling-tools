import { useEffect } from 'react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookSDKLoaderProps {
  appId: string;
  onLoad: () => void;
}

export const FacebookSDKLoader: React.FC<FacebookSDKLoaderProps> = ({
  appId,
  onLoad
}) => {
  useEffect(() => {
    const loadFacebookSDK = () => {
      console.log('Starting Facebook SDK initialization...');
      
      // Remove existing Facebook SDK if present
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
      }

      // Clear any existing FB cookies
      document.cookie = 'fblo_' + appId + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // Initialize Facebook SDK
      window.fbAsyncInit = function() {
        if (!window.FB) {
          console.error('Facebook SDK failed to load properly');
          return;
        }

        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v19.0' // Updated to latest stable version
        });
        
        // Disable impression logging to prevent errors
        if (window.FB.Event && window.FB.Event.subscribe) {
          window.FB.Event.subscribe('edge.create', () => {});
          window.FB.Event.subscribe('edge.remove', () => {});
        }
        
        console.log('Facebook SDK initialized successfully');
        onLoad();
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        let js: HTMLScriptElement;
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        js.async = true;
        js.defer = true;
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();

    // Cleanup function
    return () => {
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
      }
      delete window.FB;
      delete window.fbAsyncInit;
    };
  }, [appId, onLoad]);

  return null;
};