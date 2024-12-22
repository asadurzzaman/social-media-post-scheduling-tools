import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

const AddAccount = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hash = window.location.hash;
      
      if (hash && session) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          try {
            // Get Facebook Pages
            const pagesResponse = await fetch(
              `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
            );
            const pagesData = await pagesResponse.json();

            if (pagesData.error) {
              toast.error("Error fetching Facebook pages: " + pagesData.error.message);
              return;
            }

            if (pagesData.data && pagesData.data.length > 0) {
              const page = pagesData.data[0]; // Using first page for simplicity
              
              // Store the social account
              const { error: insertError } = await supabase
                .from('social_accounts')
                .insert({
                  user_id: session.user.id,
                  platform: 'facebook',
                  account_name: page.name,
                  access_token: accessToken,
                  page_id: page.id,
                  page_access_token: page.access_token,
                  token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
                });

              if (insertError) {
                toast.error("Failed to save Facebook account");
                console.error("Error saving account:", insertError);
                return;
              }

              toast.success("Facebook page connected successfully!");
              navigate('/');
            } else {
              toast.error("No Facebook pages found. Please make sure you have a Facebook page.");
            }
          } catch (error) {
            console.error("Error processing Facebook connection:", error);
            toast.error("Failed to connect Facebook account");
          }
        }
      }
    };

    handleAuthCallback();
  }, [navigate]);

  const handleConnectFacebook = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          scopes: 'pages_show_list,pages_read_engagement,pages_manage_posts',
          redirectTo: `${window.location.origin}/add-account`
        }
      });

      if (error) {
        toast.error("Failed to connect Facebook account");
        console.error("Facebook connection error:", error);
        return;
      }

      if (data) {
        toast.success("Connecting to Facebook...");
      }
    } catch (error) {
      toast.error("An error occurred while connecting to Facebook");
      console.error("Facebook connection error:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Social Account</h2>
          <p className="text-muted-foreground">Connect your social media accounts to start posting</p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Connect Facebook</CardTitle>
              <CardDescription>
                Connect your Facebook account to manage your pages and posts. Make sure you have a Facebook page before connecting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleConnectFacebook}
                className="w-full sm:w-auto"
              >
                <Facebook className="mr-2 h-4 w-4" />
                Connect Facebook Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddAccount;