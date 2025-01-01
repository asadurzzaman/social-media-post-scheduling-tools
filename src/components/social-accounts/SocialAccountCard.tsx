import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SocialAccountCardProps {
  platform: string;
  icon: React.ReactNode;
  title: string;
  isConnected?: boolean;
  accountName?: string;
  accountId?: string;
  onDisconnect?: () => void;
  children: React.ReactNode;
  avatarUrl?: string;
}

export const SocialAccountCard = ({
  platform,
  icon,
  title,
  isConnected,
  accountName,
  accountId,
  onDisconnect,
  children,
  avatarUrl
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

  const getDisplayName = () => {
    if (!accountName) {
      return platform === 'linkedin' ? 'LinkedIn Profile' : `${platform} Page`;
    }
    return accountName;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          {platform === 'linkedin' ? (
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${accountName}`} />
              <AvatarFallback className="bg-accent">
                {icon}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-accent rounded-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            {isConnected && (
              <p className="text-sm font-medium text-primary">
                {getDisplayName()}
              </p>
            )}
          </div>
        </div>
        {isConnected ? (
          <Button 
            variant="destructive" 
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect"}
          </Button>
        ) : (
          children
        )}
      </CardHeader>
      <CardContent>
        {isConnected && (
          <div className="text-sm text-muted-foreground">
            Connected as <span className="font-medium">{getDisplayName()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};