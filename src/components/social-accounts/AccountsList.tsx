import { Facebook, Instagram, Linkedin } from "lucide-react";
import { SocialAccountCard } from "./SocialAccountCard";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string;
}

interface AccountsListProps {
  facebookAccounts: SocialAccount[];
  instagramAccounts: SocialAccount[];
  linkedinAccounts: SocialAccount[];
  onDisconnect: (accountId: string) => void;
}

export const AccountsList = ({
  facebookAccounts,
  instagramAccounts,
  linkedinAccounts,
  onDisconnect,
}: AccountsListProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Facebook Pages</h3>
        {facebookAccounts.length === 0 ? (
          <p className="text-muted-foreground">No Facebook pages connected</p>
        ) : (
          facebookAccounts.map((account) => (
            <SocialAccountCard
              key={account.id}
              platform="facebook"
              icon={<Facebook className="h-6 w-6 text-[#1877F2]" />}
              title="Facebook Page"
              isConnected={true}
              accountName={account.account_name}
              accountId={account.id}
              onDisconnect={() => onDisconnect(account.id)}
            >
              {null}
            </SocialAccountCard>
          ))
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Instagram Business Accounts</h3>
        {instagramAccounts.length === 0 ? (
          <p className="text-muted-foreground">No Instagram accounts connected</p>
        ) : (
          instagramAccounts.map((account) => (
            <SocialAccountCard
              key={account.id}
              platform="instagram"
              icon={<Instagram className="h-6 w-6 text-[#E4405F]" />}
              title="Instagram Business Account"
              isConnected={true}
              accountName={account.account_name}
              accountId={account.id}
              onDisconnect={() => onDisconnect(account.id)}
            >
              {null}
            </SocialAccountCard>
          ))
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">LinkedIn Pages</h3>
        {linkedinAccounts.length === 0 ? (
          <p className="text-muted-foreground">No LinkedIn pages connected</p>
        ) : (
          linkedinAccounts.map((account) => (
            <SocialAccountCard
              key={account.id}
              platform="linkedin"
              icon={<Linkedin className="h-6 w-6 text-[#0A66C2]" />}
              title="LinkedIn Page"
              isConnected={true}
              accountName={account.account_name}
              accountId={account.id}
              avatarUrl={account.avatar_url}
              onDisconnect={() => onDisconnect(account.id)}
            >
              {null}
            </SocialAccountCard>
          ))
        )}
      </div>
    </div>
  );
};