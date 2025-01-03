import { Instagram } from "lucide-react";
import { SocialAccountCard } from "./SocialAccountCard";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string;
}

interface AccountsListProps {
  instagramAccounts?: SocialAccount[];
  onDisconnect: (accountId: string) => void;
}

export const AccountsList = ({
  instagramAccounts = [],
  onDisconnect,
}: AccountsListProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Instagram Business Accounts</h3>
        {instagramAccounts.length === 0 ? (
          <p className="text-muted-foreground">No Instagram accounts connected</p>
        ) : (
          <div className="space-y-4">
            {instagramAccounts.map((account) => (
              <SocialAccountCard
                key={account.id}
                platform="instagram"
                icon={<Instagram className="h-6 w-6 text-[#E4405F]" />}
                title="Instagram Business Account"
                isConnected={true}
                accountName={account.account_name}
                accountId={account.id}
                onDisconnect={() => onDisconnect(account.id)}
                avatarUrl={account.avatar_url}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};