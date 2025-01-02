declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (callback: (response: {
        authResponse?: {
          accessToken: string;
        };
        status?: string;
      }) => void, params: { scope: string; return_scopes: boolean }) => void;
    };
    fbAsyncInit: () => void;
  }
}

export const handleFacebookAuth = async (): Promise<string> => {
  try {
    console.log('Starting Facebook auth process...');
    
    // Initialize Facebook SDK
    await initFacebookSDK();
    console.log('Facebook SDK initialized');

    // Trigger Facebook login
    const response = await new Promise<{ authResponse?: { accessToken: string } }>((resolve, reject) => {
      window.FB.login((response) => {
        console.log('Facebook login response:', response);
        if (response.authResponse) {
          resolve(response);
        } else {
          reject(new Error('User cancelled login or did not fully authorize'));
        }
      }, {
        scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata',
        return_scopes: true
      });
    });

    console.log('Facebook auth successful, token obtained');
    return response.authResponse!.accessToken;
  } catch (error: any) {
    console.error('Facebook auth error:', error);
    throw error;
  }
};

const initFacebookSDK = async (): Promise<void> => {
  return new Promise((resolve) => {
    // Check if SDK is already loaded
    if (typeof window.FB !== 'undefined') {
      console.log('Facebook SDK already loaded');
      resolve();
      return;
    }

    console.log('Loading Facebook SDK...');
    
    // Set up the FB init callback
    window.fbAsyncInit = () => {
      const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
      console.log('Initializing Facebook SDK with App ID:', appId);
      
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v19.0'
      });
      resolve();
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};