interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: FacebookAuthResponse | null;
}

interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn: number;
  signedRequest: string;
  graphDomain: string;
  data_access_expiration_time: number;
}

interface FacebookSDK {
  init(options: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }): void;
  login(
    callback: (response: FacebookLoginStatusResponse) => void,
    options: {
      scope: string;
      return_scopes: boolean;
      auth_type?: string;
    }
  ): void;
  getLoginStatus(callback: (response: FacebookLoginStatusResponse) => void): void;
  logout(callback: () => void): void;
}

declare global {
  interface Window {
    FB: FacebookSDK;
    fbAsyncInit?: () => void;
  }
}

export {};