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

        // Clear FB cookies
        document.cookie = `fblo_${config.appId}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.facebook.com`;
        
        // Initialize SDK
        window.fbAsyncInit = function() {
          window.FB.init({
            appId: config.appId,
            cookie: true,
            xfbml: true,
            version: config.version
          });

          // Create empty function for event handlers
          const emptyHandler = () => {};

          // Disable all tracking and logging
          if (window.FB.Event && window.FB.Event.unsubscribe) {
            window.FB.Event.unsubscribe('edge.create', emptyHandler);
            window.FB.Event.unsubscribe('edge.remove', emptyHandler);
            window.FB.Event.unsubscribe('auth.login', emptyHandler);
            window.FB.Event.unsubscribe('auth.logout', emptyHandler);
            window.FB.Event.unsubscribe('xfbml.render', emptyHandler);
          }

          // Mock all tracking functions
          if (window.FB.AppEvents) {
            window.FB.AppEvents.logEvent = () => {};
            window.FB.AppEvents.activateApp = () => {};
            window.FB.AppEvents.logPageView = () => {};
          }

          // Disable impression logging
          const originalInit = window.FB.init;
          window.FB.init = function(...args: any[]) {
            const result = originalInit.apply(this, args);
            if (window.FB.Event && window.FB.Event.subscribe) {
              window.FB.Event.subscribe = () => {};
            }
            return result;
          };

          // Mock additional tracking functions
          window.FB.Event = {
            ...window.FB.Event,
            subscribe: () => {},
            unsubscribe: () => {}
          };

          console.log('Facebook SDK initialized successfully with tracking disabled');
          resolve();
        };

        // Load SDK
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
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