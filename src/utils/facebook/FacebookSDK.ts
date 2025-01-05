declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const initializeFacebookSDK = (appId: string, onLoad: () => void) => {
  // Clear any existing FB instance and related objects
  if (window.FB) {
    delete window.FB;
  }
  
  // Remove any existing FB cookies
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('fb') || name.startsWith('_fb')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });

  window.fbAsyncInit = function() {
    window.FB.init({
      appId: appId,
      cookie: false, // Disable cookies
      xfbml: false, // Disable XFBML parsing
      version: 'v18.0',
      status: false, // Disable status check
      autoLogAppEvents: false // Disable automatic event logging
    });
    
    // Mock all tracking and event functions
    window.FB.AppEvents = {
      logEvent: () => {},
      logPageView: () => {},
      setUserID: () => {},
      updateUserProperties: () => {},
      clearUserID: () => {},
      activateApp: () => {},
      logPurchase: () => {}
    };

    // Mock Event system
    window.FB.Event = {
      subscribe: () => {},
      unsubscribe: () => {},
      clear: () => {}
    };

    // Mock impression logging
    window.FB.Impressions = {
      log: () => {},
      impression: () => {}
    };

    // Mock tracking
    window.FB.tracking = false;
    window.FB.trackingEnabled = () => false;
    window.FB.Tracking = {
      enabled: false,
      enable: () => {},
      disable: () => {}
    };

    // Disable all event subscriptions
    const events = ['edge.create', 'edge.remove', 'auth.login', 'auth.logout', 'auth.prompt', 'auth.authResponseChange', 'auth.statusChange', 'xfbml.render'];
    events.forEach(event => {
      if (window.FB.Event && window.FB.Event.unsubscribe) {
        window.FB.Event.unsubscribe(event);
      }
    });

    console.log('Facebook SDK initialized with all tracking disabled');
    onLoad();
  };

  // Remove existing Facebook SDK if present
  const existingScript = document.getElementById('facebook-jssdk');
  if (existingScript) {
    existingScript.remove();
  }

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