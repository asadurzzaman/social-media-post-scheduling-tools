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

          // Disable all tracking and logging
          if (window.FB.Event && window.FB.Event.unsubscribe) {
            // Create empty functions for each event type
            const emptyHandler = () => {};
            window.FB.Event.unsubscribe('edge.create', emptyHandler);
            window.FB.Event.unsubscribe('edge.remove', emptyHandler);
            window.FB.Event.unsubscribe('auth.login', emptyHandler);
            window.FB.Event.unsubscribe('auth.logout', emptyHandler);
            window.FB.Event.unsubscribe('xfbml.render', emptyHandler);
          }

          // Mock all tracking functions
          window.FB.AppEvents = {
            logEvent: () => {},
            EventNames: {},
            ParameterNames: {}
          };

          // Mock additional tracking functions
          window.FB.Event = {
            ...window.FB.Event,
            subscribe: () => {},
            unsubscribe: () => {}
          };

          console.log('Facebook SDK initialized successfully');
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