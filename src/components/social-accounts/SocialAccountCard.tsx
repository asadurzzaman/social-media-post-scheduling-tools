import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, X, Check } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface SocialAccountCardProps {
  platform: string;
  icon: React.ReactNode;
  title: string;
  isConnected?: boolean;
  accountName?: string;
  accountId?: string;
  onDisconnect?: () => void;
  children: React.ReactNode;
}

export const SocialAccountCard = ({
  platform,
  icon,
  title,
  isConnected,
  accountName,
  accountId,
  onDisconnect,
  children
}: SocialAccountCardProps) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(accountName || '');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleDisconnect = async () => {
    if (!accountId) return;
    
    try {
      setIsDisconnecting(true);
      
      // Check session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        toast.error("Please sign in to continue");
        return;
      }

      // If it's a Facebook account, logout from Facebook SDK
      if (platform.toLowerCase() === 'facebook' && window.FB) {
        try {
          await new Promise<void>((resolve) => {
            window.FB.logout(() => {
              console.log('Logged out from Facebook SDK');
              resolve();
            });
          });
        } catch (fbError) {
          console.error('Error logging out from Facebook:', fbError);
          // Continue with account deletion even if FB logout fails
        }
      }

      // First, delete all posts associated with this social account
      const { error: postsError } = await supabase
        .from('posts')
        .delete()
        .eq('social_account_id', accountId);

      if (postsError) {
        console.error('Error deleting associated posts:', postsError);
        throw new Error('Failed to delete associated posts');
      }

      // Then delete the social account with retry logic
      const deleteAccount = async (attempt: number): Promise<void> => {
        try {
          const { error: accountError } = await supabase
            .from('social_accounts')
            .delete()
            .eq('id', accountId);

          if (accountError) throw accountError;
          
          toast.success(`${platform} account disconnected successfully`);
          
          // Call the onDisconnect callback if provided
          if (onDisconnect) {
            onDisconnect();
          }

        } catch (error) {
          console.error(`Attempt ${attempt} - Error disconnecting account:`, error);
          
          if (attempt < MAX_RETRIES) {
            // Exponential backoff
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return deleteAccount(attempt + 1);
          }
          throw error;
        }
      };

      await deleteAccount(0);

      // Reinitialize Facebook SDK if it was a Facebook account
      if (platform.toLowerCase() === 'facebook' && window.FB) {
        window.FB.init({
          appId: '1294294115054311',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        console.log('Facebook SDK reinitialized');
      }

    } catch (error: any) {
      console.error(`Error disconnecting ${platform} account:`, error);
      toast.error(error.message || `Failed to disconnect ${platform} account`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleUpdateName = async () => {
    if (!accountId || !newName.trim()) return;

    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ account_name: newName.trim() })
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Account name updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating account name:', error);
      toast.error('Failed to update account name');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            {isConnected && (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-8 w-48"
                      placeholder="Enter new name"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleUpdateName}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setNewName(accountName || '');
                      }}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{accountName}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="h-6 w-6"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {isConnected ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isDisconnecting}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disconnect your {platform} account and delete all associated posts. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnect}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          children
        )}
      </div>
    </div>
  );
};