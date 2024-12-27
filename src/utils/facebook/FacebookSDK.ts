import type { FacebookLoginStatus } from '@/types/facebook';

export interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn: number;
  signedRequest: string;
  graphDomain: string;
  data_access_expiration_time: number;
}

export interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: FacebookAuthResponse | null;
}

export class FacebookSDK {
  private static instance: FacebookSDK;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): FacebookSDK {
    if (!FacebookSDK.instance) {
      FacebookSDK.instance = new FacebookSDK();
    }
    return FacebookSDK.instance;
  }

  async initialize(appId: string): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
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
        window.FB.getLoginStatus((response) => {
          console.log('FB SDK initialized, status:', response.status);
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
      js.onerror = () => reject(new Error('Failed to load Facebook SDK'));
      
      const fjs = document.getElementsByTagName('script')[0];
      fjs.parentNode?.insertBefore(js, fjs);
    });

    return this.initPromise;
  }

  async login(): Promise<FacebookLoginStatusResponse> {
    if (!window.FB) {
      throw new Error('Facebook SDK not initialized');
    }

    return new Promise((resolve) => {
      window.FB.login((response: FacebookLoginStatus) => {
        console.log('Login response:', response);
        // Convert FacebookLoginStatus to FacebookLoginStatusResponse
        const convertedResponse: FacebookLoginStatusResponse = {
          status: response.status,
          authResponse: response.authResponse ? {
            accessToken: response.authResponse.accessToken,
            userID: response.authResponse.userID,
            expiresIn: parseInt(response.authResponse.expiresIn),
            signedRequest: response.authResponse.signedRequest,
            graphDomain: response.authResponse.graphDomain || '',
            data_access_expiration_time: response.authResponse.data_access_expiration_time || 0
          } : null
        };
        resolve(convertedResponse);
      }, {
        scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts',
        return_scopes: true,
        auth_type: 'rerequest'
      });
    });
  }

  cleanup(): void {
    const existingScript = document.getElementById('facebook-jssdk');
    if (existingScript) {
      existingScript.remove();
    }
    delete window.FB;
    delete window.fbAsyncInit;
    this.initPromise = null;
  }
}