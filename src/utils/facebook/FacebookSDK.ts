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

        // Remove any existing FB cookies
        document.cookie = `fblo_${config.appId}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.facebook.com`;
        
        // Initialize SDK with absolute minimal features
        window.fbAsyncInit = function() {
          // Override FB.init before it's called
          const originalInit = window.FB.init;
          window.FB.init = function(...args: any[]) {
            // Call original init with modified config
            return originalInit.call(this, {
              ...args[0],
              xfbml: false,
              autoLogAppEvents: false,
              status: false
            });
          };

          // Initialize with minimal config
          window.FB.init({
            appId: config.appId,
            cookie: true,
            xfbml: false,
            version: config.version,
            autoLogAppEvents: false,
            status: false
          });

          // Completely disable all tracking and logging functions
          if (window.FB.AppEvents) {
            window.FB.AppEvents = {
              ...window.FB.AppEvents,
              logEvent: () => {},
              activateApp: () => {},
              logPageView: () => {},
              clearUserID: () => {},
              setUserID: () => {},
              updateUserProperties: () => {},
              setAppVersion: () => {},
              EventNames: {},
              ParameterNames: {}
            };
          }

          // Disable all event subscriptions
          if (window.FB.Event) {
            window.FB.Event = {
              subscribe: () => {},
              unsubscribe: () => {},
              clear: () => {}
            };
          }

          // Disable XFBML parsing
          if (window.FB.XFBML) {
            window.FB.XFBML.parse = () => {};
          }

          console.log('Facebook SDK initialized with all tracking disabled');
          resolve();
        };

        // Load SDK with debug and logging disabled
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = `https://connect.facebook.net/en_US/sdk.js?debug=false`;
        js.async = true;
        js.defer = true;
        js.crossOrigin = 'anonymous';
        const fjs = document.getElementsByTagName('script')[0];
        fjs.parentNode?.insertBefore(js, fjs);
      } catch (error) {
        reject(error);
      }
    });
  }

  static cleanup(appId: string): void {
    // Remove SDK script
    const existingScript = document.getElementById('facebook-jssdk');
    if (existingScript) {
      existingScript.remove();
    }

    // Clear FB instance and cookies
    delete window.FB;
    delete window.fbAsyncInit;
    document.cookie = `fblo_${appId}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.facebook.com`;
  }
}