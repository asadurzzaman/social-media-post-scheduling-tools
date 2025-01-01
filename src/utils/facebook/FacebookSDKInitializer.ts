export class FacebookSDKInitializer {
  private static isInitialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(appId: string): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    console.log('Initializing Facebook SDK...');

    this.initPromise = new Promise((resolve, reject) => {
      try {
        // Remove existing SDK if present
        const existingScript = document.getElementById('facebook-jssdk');
        if (existingScript) {
          existingScript.remove();
        }

        // Load the SDK
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        js.async = true;
        js.defer = true;
        js.crossOrigin = "anonymous";
        
        js.onload = () => {
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
        };

        js.onerror = (error) => {
          console.error('Failed to load Facebook SDK:', error);
          this.isInitialized = false;
          reject(new Error('Failed to load Facebook SDK'));
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