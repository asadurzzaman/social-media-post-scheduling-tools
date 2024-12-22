import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AddAccount = () => {
  const navigate = useNavigate();

  const handleConnectFacebook = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          scopes: 'pages_manage_posts,pages_read_engagement',
          redirectTo: `${window.location.origin}/add-account`
        }
      });

      if (error) {
        toast.error("Failed to connect Facebook account");
        console.error("Facebook connection error:", error);
        return;
      }

      if (data) {
        toast.success("Facebook account connected successfully!");
        // After successful connection, we'll handle the token in a separate function
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
                Connect your Facebook account to manage your pages and posts
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