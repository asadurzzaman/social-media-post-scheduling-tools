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

        // Initialize SDK with minimal tracking
        window.fbAsyncInit = function() {
          window.FB.init({
            appId: config.appId,
            cookie: true,
            xfbml: false, // Disable XFBML parsing
            version: config.version
          });

          // Disable all tracking functions
          if (window.FB.AppEvents) {
            window.FB.AppEvents.logEvent = () => {};
            window.FB.AppEvents.activateApp = () => {};
            window.FB.AppEvents.logPageView = () => {};
          }

          // Disable event subscriptions
          if (window.FB.Event) {
            window.FB.Event.subscribe = () => {};
            window.FB.Event.unsubscribe = () => {};
          }

          console.log('Facebook SDK initialized with minimal tracking');
          resolve();
        };

        // Load SDK with minimal features
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = `https://connect.facebook.net/en_US/sdk.js?debug=false`;
        js.async = true;
        js.defer = true;
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