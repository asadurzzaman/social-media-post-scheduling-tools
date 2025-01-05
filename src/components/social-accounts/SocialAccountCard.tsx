import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, X, Check } from "lucide-react";

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

  const handleDisconnect = async () => {
    if (!onDisconnect) return;
    
    try {
      setIsDisconnecting(true);
      
      // If it's a Facebook account, logout from Facebook SDK
      if (platform === 'Facebook' && window.FB) {
        await new Promise<void>((resolve) => {
          window.FB.logout(() => {
            console.log('Logged out from Facebook SDK');
            resolve();
          });
        });
      }

      await onDisconnect();
      toast.success(`${platform} account disconnected successfully`);

      // Reinitialize Facebook SDK if it was a Facebook account
      if (platform === 'Facebook' && window.FB) {
        window.FB.init({
          appId: '1294294115054311',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        console.log('Facebook SDK reinitialized');
      }
    } catch (error) {
      console.error(`Error disconnecting ${platform} account:`, error);
      toast.error(`Failed to disconnect ${platform} account`);
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
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
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
        <Button 
          variant="outline" 
          onClick={handleDisconnect}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
        </Button>
      ) : (
        children
      )}
    </div>
  );
};