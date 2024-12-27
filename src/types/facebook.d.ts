export interface FacebookLoginStatus {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: {
    accessToken: string;
    expiresIn: string;
    reauthorize_required_in?: string;
    signedRequest: string;
    userID: string;
    graphDomain?: string;
    data_access_expiration_time?: number;
  } | null;
}

export interface FacebookLoginOptions {
  scope?: string;
  return_scopes?: boolean;
  auth_type?: string;
}

export interface FacebookSDKInterface {
  init(options: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;
  login(
    callback: (response: FacebookLoginStatus) => void,
    options?: FacebookLoginOptions
  ): void;
  getLoginStatus(callback: (response: FacebookLoginStatus) => void): void;
  logout(callback: (response: FacebookLoginStatus) => void): void;
}

declare global {
  interface Window {
    FB: FacebookSDKInterface;
    fbAsyncInit: () => void;
  }
}