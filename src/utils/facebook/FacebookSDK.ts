interface FacebookSDKConfig {
  appId: string;
  version: string;
}

export class FacebookSDK {
  static async initialize(config: FacebookSDKConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Remove existing SDK if present
        const existingScript = document.getElementById('facebook-jssdk');
        if (existingScript) {
          existingScript.remove();
        }

        // Clear all Facebook cookies
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          if (cookie.includes('fb') || cookie.includes('FB')) {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.facebook.com`;
          }
        }
        
        // Define async init function
        window.fbAsyncInit = function() {
          window.FB.init({
            appId: config.appId,
            cookie: true,
            xfbml: true,
            version: config.version
          });

          // Check login status after initialization
          window.FB.getLoginStatus((response) => {
            if (response.status === 'connected') {
              console.log('Already connected to Facebook');
            } else {
              console.log('Not connected to Facebook:', response.status);
            }
            resolve();
          });
        };

        // Load SDK
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        js.async = true;
        js.defer = true;
        js.crossOrigin = 'anonymous';
        js.onerror = () => {
          console.error('Failed to load Facebook SDK script');
          reject(new Error('Failed to load Facebook SDK'));
        };
        
        const fjs = document.getElementsByTagName('script')[0];
        if (!fjs?.parentNode) {
          reject(new Error('Could not find parent node for script'));
          return;
        }
        fjs.parentNode.insertBefore(js, fjs);
      } catch (error) {
        console.error('Error initializing Facebook SDK:', error);
        reject(error);
      }
    });
  }

  static cleanup(appId: string): void {
    try {
      // Remove SDK script
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
      }

      // Clear FB instance
      delete window.FB;
      delete window.fbAsyncInit;

      // Clear all Facebook cookies
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        if (cookie.includes('fb') || cookie.includes('FB')) {
          const name = cookie.split('=')[0].trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.facebook.com`;
        }
      }

      console.log('Facebook SDK cleanup completed');
    } catch (error) {
      console.error('Error during Facebook SDK cleanup:', error);
    }
  }
}