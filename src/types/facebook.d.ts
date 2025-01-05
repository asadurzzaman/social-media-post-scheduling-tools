interface FacebookEventSubscription {
  subscribe: (callback: Function) => void;
  unsubscribe: (eventName: string, callback: Function) => void;
  clear: () => void;
}

interface FacebookAppEvents {
  logEvent: (name: string, ...args: any[]) => void;
  EventNames: Record<string, string>;
  ParameterNames: Record<string, string>;
  activateApp: () => void;
  logPageView: () => void;
  clearUserID: () => void;
  setUserID: (userID: string) => void;
  updateUserProperties: (properties: object) => void;
  setAppVersion: (version: string) => void;
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

interface FacebookXFBML {
  parse: () => void;
  parseElement: () => void;
}

interface FacebookSDKInterface {
  init: (params: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
    autoLogAppEvents?: boolean;
    status?: boolean;
    frictionlessRequests?: boolean;
    logging?: boolean;
  }) => void;
  login: (
    callback: (response: FacebookLoginStatus) => void,
    options?: FacebookLoginOptions
  ) => void;
  logout: (callback: (response: any) => void) => void;
  getLoginStatus: (callback: (response: FacebookLoginStatus) => void) => void;
  Event: FacebookEventSubscription;
  AppEvents: FacebookAppEvents;
  XFBML: FacebookXFBML;
}

interface Window {
  FB: FacebookSDKInterface;
  fbAsyncInit: () => void;
}