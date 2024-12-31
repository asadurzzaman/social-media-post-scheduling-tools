import { FacebookSDKInitializer } from './FacebookSDKInitializer';

export class FacebookLoginService {
  static async login(appId: string): Promise<{ accessToken: string; userId: string }> {
    try {
      await FacebookSDKInitializer.initialize(appId);
      
      if (!window.FB) {
        throw new Error('Facebook SDK not loaded');
      }

      const response = await new Promise<any>((resolve, reject) => {
        window.FB.login((loginResponse) => {
          if (loginResponse.status === 'connected') {
            resolve(loginResponse);
          } else {
            reject(new Error('Login failed or was cancelled'));
          }
        }, {
          scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts',
          return_scopes: true,
          auth_type: 'rerequest'
        });
      });

      if (!response.authResponse) {
        throw new Error('No auth response received');
      }

      return {
        accessToken: response.authResponse.accessToken,
        userId: response.authResponse.userID
      };
    } catch (error: any) {
      console.error('Facebook login error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    if (window.FB) {
      await new Promise<void>((resolve) => {
        window.FB.logout(() => {
          resolve();
        });
      });
    }
  }
}