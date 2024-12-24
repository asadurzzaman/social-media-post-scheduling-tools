import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SocialAccountCardProps {
  platform: string;
  icon: React.ReactNode;
  title: string;
  isConnected?: boolean;
  accountName?: string;
  onDisconnect?: () => void;
  children: React.ReactNode;
}

export const SocialAccountCard = ({
  platform,
  icon,
  title,
  isConnected,
  accountName,
  onDisconnect,
  children
}: SocialAccountCardProps) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!onDisconnect) return;
    
    try {
      setIsDisconnecting(true);
      await onDisconnect();
      toast.success(`${platform} account disconnected successfully`);
    } catch (error) {
      console.error(`Error disconnecting ${platform} account:`, error);
      toast.error(`Failed to disconnect ${platform} account`);
    } finally {
      setIsDisconnecting(false);
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
          {isConnected && accountName && (
            <p className="text-sm text-muted-foreground">{accountName}</p>
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