import { supabase } from "@/integrations/supabase/client";

export class FacebookTokenManager {
  static async getLongLivedToken(shortLivedToken: string, appId: string): Promise<string> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${appId}&` +
        `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
        `fb_exchange_token=${shortLivedToken}`
      );
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data.access_token;
    } catch (error) {
      console.error('Error getting long-lived token:', error);
      throw error;
    }
  }

  static async updateTokenInDatabase(accessToken: string, expiresIn: number) {
    try {
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);

      const { error } = await supabase
        .from('social_accounts')
        .update({
          access_token: accessToken,
          token_expires_at: expirationDate.toISOString()
        })
        .eq('platform', 'facebook');

      if (error) {
        console.error('Error updating token in database:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to update token in database:', error);
      throw error;
    }
  }
}