import { supabase } from "@/integrations/supabase/client";
import { checkExistingAccount } from "@/utils/socialAccounts";

export class FacebookPageManager {
  static async fetchPages(accessToken: string): Promise<any> {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
    );
    const data = await response.json();
    
    if (data.error) {
      console.error("Facebook API Error:", data.error);
      throw new Error(data.error.message);
    }
    
    return data;
  }

  static async savePagesToDatabase(
    pages: any[],
    userId: string,
    onProgress: (added: number, duplicates: number) => void
  ) {
    let addedPages = 0;
    let duplicatePages = 0;

    for (const page of pages) {
      const isExisting = await checkExistingAccount('facebook', page.id, 'page_id');
      if (isExisting) {
        duplicatePages++;
        continue;
      }

      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          user_id: userId,
          platform: 'facebook',
          account_name: page.name,
          access_token: page.access_token,
          page_id: page.id,
          page_access_token: page.access_token,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (insertError) {
        console.error("Error saving account:", insertError);
        throw insertError;
      }
      
      addedPages++;
      onProgress(addedPages, duplicatePages);
    }

    return { addedPages, duplicatePages };
  }
}