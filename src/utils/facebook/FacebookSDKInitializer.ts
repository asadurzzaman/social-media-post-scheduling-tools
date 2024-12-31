export class FacebookSDKInitializer {
  private static isInitialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(appId: string): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      try {
        // Clean up any existing SDK
        const existingScript = document.getElementById('facebook-jssdk');
        if (existingScript) {
          existingScript.remove();
        }

        // Clear FB cookies
        document.cookie = 'fblo_' + appId + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // Load the SDK
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        js.async = true;
        js.defer = true;
        js.crossOrigin = "anonymous";
        
        js.onerror = () => {
          console.error('Failed to load Facebook SDK');
          this.isInitialized = false;
          reject(new Error('Failed to load Facebook SDK'));
        };

        window.fbAsyncInit = () => {
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });

          console.log('Facebook SDK initialized');
          this.isInitialized = true;
          resolve();
        };
        
        const fjs = document.getElementsByTagName('script')[0];
        if (fjs?.parentNode) {
          fjs.parentNode.insertBefore(js, fjs);
        } else {
          document.head.appendChild(js);
        }
      } catch (error) {
        console.error('Error initializing Facebook SDK:', error);
        this.isInitialized = false;
        reject(error);
      }
    });

    return this.initPromise;
  }

  static cleanup(): void {
    const existingScript = document.getElementById('facebook-jssdk');
    if (existingScript) {
      existingScript.remove();
    }
    delete window.FB;
    delete window.fbAsyncInit;
    this.initPromise = null;
    this.isInitialized = false;
  }
}