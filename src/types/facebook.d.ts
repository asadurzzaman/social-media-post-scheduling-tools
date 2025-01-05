interface FacebookEventSubscription {
  subscribe: (callback: Function) => void;
  unsubscribe: (eventName: string, callback: Function) => void;
}

interface FacebookAppEvents {
  logEvent: (name: string, ...args: any[]) => void;
  EventNames: Record<string, string>;
  ParameterNames: Record<string, string>;
}

interface FacebookLoginStatus {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: {
    accessToken: string;
    userID: string;
    expiresIn: number;
    signedRequest: string;
  } | null;
}

interface FacebookLoginOptions {
  scope?: string;
  return_scopes?: boolean;
  enable_profile_selector?: boolean;
  auth_type?: string;
}

interface FacebookSDKInterface {
  init: (params: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }) => void;
  login: (
    callback: (response: FacebookLoginStatus) => void,
    options?: FacebookLoginOptions
  ) => void;
  logout: (callback: (response: any) => void) => void;
  Event: FacebookEventSubscription;
  AppEvents: FacebookAppEvents;
}

interface Window {
  FB: FacebookSDKInterface;
  fbAsyncInit: () => void;
}