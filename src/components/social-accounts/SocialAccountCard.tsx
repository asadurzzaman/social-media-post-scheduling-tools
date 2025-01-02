import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SocialAccountCardProps {
  platform: string;
  icon: React.ReactNode;
  title: string;
  isConnected?: boolean;
  accountName?: string;
  accountId?: string;
  onDisconnect?: () => void;
  children?: React.ReactNode;
  avatarUrl?: string;
}

export const SocialAccountCard = ({
  platform,
  icon,
  title,
  accountName,
  accountId,
  onDisconnect,
}: SocialAccountCardProps) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!accountId) return;
    
    try {
      setIsDisconnecting(true);
      
      // First, delete all posts associated with this social account
      const { error: postsError } = await supabase
        .from('posts')
        .delete()
        .eq('social_account_id', accountId);

      if (postsError) {
        console.error('Error deleting associated posts:', postsError);
        throw new Error('Failed to delete associated posts');
      }

      // Then delete the social account
      const { error: accountError } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId)
        .single();

      if (accountError) {
        console.error('Error disconnecting account:', accountError);
        throw accountError;
      }

      toast.success(`${platform} account disconnected successfully`);

      // Call the onDisconnect callback if provided
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error(`Error disconnecting ${platform} account:`, error);
      toast.error(`Failed to disconnect ${platform} account`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-primary">{accountName}</p>
          </div>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="rounded-full px-6"
        >
          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Connected as <span className="font-medium">{accountName}</span>
      </p>
    </Card>
  );
};