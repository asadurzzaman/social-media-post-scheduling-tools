import type { FacebookLoginStatus, FacebookLoginOptions } from '@/types/facebook';

export class FacebookSDK {
  private static instance: FacebookSDK;
  private initPromise: Promise<void> | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): FacebookSDK {
    if (!FacebookSDK.instance) {
      FacebookSDK.instance = new FacebookSDK();
    }
    return FacebookSDK.instance;
  }

  async waitForInitialization(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) {
      await this.initPromise;
      return;
    }
    throw new Error('SDK not initialized');
  }

  async initialize(appId: string): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = new Promise((resolve, reject) => {
      try {
        // Remove existing SDK if present
        const existingScript = document.getElementById('facebook-jssdk');
        if (existingScript) {
          existingScript.remove();
        }

        // Clear FB cookies
        document.cookie = 'fblo_' + appId + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // Define async init function
        window.fbAsyncInit = () => {
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });

          // Verify initialization
          window.FB.getLoginStatus((response: FacebookLoginStatus) => {
            console.log('FB SDK initialized, status:', response.status);
            this.isInitialized = true;
            resolve();
          });
        };

        // Load the SDK
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        js.async = true;
        js.defer = true;
        js.crossOrigin = "anonymous";
        
        js.onerror = (error) => {
          console.error('Failed to load Facebook SDK:', error);
          this.isInitialized = false;
          reject(new Error('Failed to load Facebook SDK'));
        };
        
        const fjs = document.getElementsByTagName('script')[0];
        if (fjs && fjs.parentNode) {
          fjs.parentNode.insertBefore(js, fjs);
        } else {
          document.head.appendChild(js);
        }
      } catch (error) {
        console.error('Error loading Facebook SDK:', error);
        this.isInitialized = false;
        reject(error);
      }
    });

    return this.initPromise;
  }

  cleanup(): void {
    try {
      const existingScript = document.getElementById('facebook-jssdk');
      if (existingScript) {
        existingScript.remove();
      }
      delete window.FB;
      delete window.fbAsyncInit;
      this.initPromise = null;
      this.isInitialized = false;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}