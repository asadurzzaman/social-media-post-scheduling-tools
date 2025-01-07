import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AccountHeader } from "./AccountHeader";
import { DisconnectButton } from "./DisconnectButton";
import type { FacebookSDK } from '@/types/facebook';

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
        }
      }

      // Delete associated posts with retry logic
      const deleteAccount = async (attempt: number): Promise<void> => {
        try {
          // First, delete all posts associated with this social account
          const { error: postsError } = await supabase
            .from('posts')
            .delete()
            .eq('social_account_id', accountId);

          if (postsError) throw postsError;

          // Then delete the social account
          const { error: accountError } = await supabase
            .from('social_accounts')
            .delete()
            .eq('id', accountId);

          if (accountError) throw accountError;
          
          toast.success(`${platform} account disconnected successfully`);
          
          if (onDisconnect) {
            onDisconnect();
          }

        } catch (error) {
          console.error(`Attempt ${attempt} - Error disconnecting account:`, error);
          
          if (attempt < MAX_RETRIES) {
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
          version: 'v19.0'
        });
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
        <AccountHeader
          icon={icon}
          title={title}
          accountName={accountName}
          isEditing={isEditing}
          newName={newName}
          onEditClick={() => setIsEditing(true)}
          onNameChange={setNewName}
          onSaveName={handleUpdateName}
          onCancelEdit={() => {
            setIsEditing(false);
            setNewName(accountName || '');
          }}
        />
        {isConnected ? (
          <DisconnectButton
            platform={platform}
            isDisconnecting={isDisconnecting}
            onDisconnect={handleDisconnect}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
};