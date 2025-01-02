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
      console.log('Starting Facebook connection process...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // Get Facebook access token
      const accessToken = await handleFacebookAuth();
      console.log('Facebook access token obtained');

      // Fetch pages with error handling
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Facebook API Error:", errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch Facebook pages');
      }

      const data = await response.json();
      console.log('Facebook pages data:', data);

      if (!data.data || data.data.length === 0) {
        throw new Error('No Facebook pages found. Make sure you have admin access to at least one Facebook page.');
      }

      // Save pages to database
      let addedPages = 0;
      let duplicatePages = 0;

      for (const page of data.data) {
        // Check if page already exists
        const { data: existingPages } = await supabase
          .from('facebook_pages')
          .select('page_id')
          .eq('page_id', page.id)
          .eq('user_id', user.id);

        if (existingPages && existingPages.length > 0) {
          duplicatePages++;
          continue;
        }

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
          console.error("Error saving page:", insertError);
          throw insertError;
        }
        
        addedPages++;
      }

      if (addedPages > 0) {
        toast.success(`Successfully connected ${addedPages} Facebook ${addedPages === 1 ? 'page' : 'pages'}`);
      } else if (duplicatePages > 0) {
        toast.info('All Facebook pages are already connected');
      } else {
        toast.error('No pages were added. Please make sure you have admin access to at least one Facebook page.');
      }

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