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
          userID: string;
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

    // Trigger Facebook login with updated permissions
    const response = await new Promise<{ authResponse?: { accessToken: string } }>((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }

      window.FB.login((response) => {
        console.log('Facebook login response:', response);
        if (response.authResponse) {
          resolve(response);
        } else {
          // More specific error message based on the status
          if (response.status === 'not_authorized') {
            reject(new Error('Please authorize the application to manage your Facebook pages'));
          } else {
            reject(new Error('Please complete the Facebook login process and grant the required permissions'));
          }
        }
      }, {
        // Updated scope to include all required permissions
        scope: [
          'public_profile',
          'pages_show_list',
          'pages_read_engagement',
          'pages_manage_posts',
          'pages_manage_metadata',
          'pages_manage_engagement'
        ].join(','),
        return_scopes: true
      });
    });

    if (!response.authResponse?.accessToken) {
      throw new Error('No access token received from Facebook');
    }

    console.log('Facebook auth successful, token obtained');
    return response.authResponse.accessToken;
  } catch (error: any) {
    console.error('Facebook auth error:', error);
    // Provide more user-friendly error messages
    if (error.message.includes('SDK')) {
      throw new Error('Failed to load Facebook integration. Please try again.');
    } else if (error.message.includes('authorize')) {
      throw new Error('Please grant all required permissions to manage your Facebook pages');
    } else {
      throw new Error(`Facebook authentication failed: ${error.message}`);
    }
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
      const appId = '2579075792280951';
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
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};