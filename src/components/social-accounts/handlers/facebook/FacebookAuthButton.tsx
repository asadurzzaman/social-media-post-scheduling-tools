import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleFacebookAuth } from './FacebookAuthHandler';

export const FacebookAuthButton = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // Get Facebook access token
      const accessToken = await handleFacebookAuth();
      console.log('Facebook access token obtained:', accessToken);

      // Fetch pages
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      const data = await response.json();
      console.log('Facebook pages data:', data);
      
      if (data.error) {
        console.error("Facebook API Error:", data.error);
        throw new Error(data.error.message);
      }

      // Save pages to database
      let addedPages = 0;
      for (const page of data.data) {
        const { error: insertError } = await supabase
          .from('facebook_pages')
          .insert({
            user_id: user.id,
            page_id: page.id,
            page_name: page.name,
            page_token: accessToken,
            page_access_token: page.access_token
          });

        if (insertError) {
          if (insertError.code === '23505') { // Unique violation
            console.log(`Page ${page.name} already exists`);
            continue;
          }
          console.error("Error saving page:", insertError);
          throw insertError;
        }
        
        addedPages++;
      }

      toast.success(`Successfully connected ${addedPages} Facebook pages`);

    } catch (error: any) {
      console.error('Facebook auth error:', error);
      toast.error(error.message || 'Failed to connect Facebook account');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button 
      onClick={handleConnect}
      disabled={isConnecting}
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
    >
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Facebook className="h-5 w-5" />
          <span>Connect Facebook Pages</span>
        </>
      )}
    </Button>
  );
};