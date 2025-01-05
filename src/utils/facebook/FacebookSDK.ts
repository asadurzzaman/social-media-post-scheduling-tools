declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const initializeFacebookSDK = (appId: string, onLoad: () => void) => {
  // Clear any existing FB instance
  if (window.FB) {
    delete window.FB;
  }

  window.fbAsyncInit = function() {
    window.FB.init({
      appId: appId,
      cookie: true,
      xfbml: false, // Disable XFBML parsing
      version: 'v18.0'
    });
    
    // Disable ALL tracking and logging
    if (window.FB.Event && window.FB.Event.subscribe) {
      window.FB.Event.unsubscribe('edge.create');
      window.FB.Event.unsubscribe('edge.remove');
      window.FB.Event.unsubscribe('auth.login');
      window.FB.Event.unsubscribe('auth.logout');
    }

    // Mock all tracking functions
    window.FB.AppEvents = {
      logEvent: () => {},
      logPageView: () => {},
      setUserID: () => {},
      updateUserProperties: () => {},
      clearUserID: () => {},
      activateApp: () => {},
      logPurchase: () => {}
    };

    // Disable impression logging
    window.FB.Event = {
      ...window.FB.Event,
      subscribe: () => {},
      unsubscribe: () => {}
    };
    
    console.log('Facebook SDK initialized with tracking disabled');
    onLoad();
  };

  // Remove existing Facebook SDK if present
  const existingScript = document.getElementById('facebook-jssdk');
  if (existingScript) {
    existingScript.remove();
  }

  // Clear any existing FB cookies
  document.cookie = 'fblo_' + appId + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Load the SDK asynchronously
  (function(d, s, id) {
    let js: HTMLScriptElement;
    const fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s) as HTMLScriptElement;
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode?.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  // Return cleanup function
  return () => {
    const script = document.getElementById('facebook-jssdk');
    if (script) {
      script.remove();
    }
    delete window.FB;
    delete window.fbAsyncInit;
  };
};