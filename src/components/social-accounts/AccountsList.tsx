import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SocialAccountCard } from "@/components/social-accounts/SocialAccountCard";
import { Linkedin, Instagram } from "lucide-react";

interface Account {
  id: string;
  platform: string;
  account_name: string;
}

interface AccountsListProps {
  facebookAccounts: Account[];
  linkedinAccounts: Account[];
  instagramAccounts: Account[];
  onDisconnect: (accountId: string) => Promise<void>;
}

export const AccountsList = ({ 
  facebookAccounts, 
  linkedinAccounts, 
  instagramAccounts,
  onDisconnect 
}: AccountsListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-8">
        {instagramAccounts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Instagram Business Accounts</h3>
            <div className="space-y-4">
              {instagramAccounts.map((account) => (
                <SocialAccountCard
                  key={account.id}
                  platform="Instagram"
                  icon={<Instagram className="w-8 h-8 text-[#E4405F]" />}
                  title="Instagram business account"
                  isConnected={true}
                  accountName={account.account_name}
                  accountId={account.id}
                  onDisconnect={() => onDisconnect(account.id)}
                >
                  <Button variant="destructive" onClick={() => onDisconnect(account.id)}>
                    Disconnect
                  </Button>
                </SocialAccountCard>
              ))}
            </div>
          </div>
        )}

        {linkedinAccounts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">LinkedIn Accounts</h3>
            <div className="space-y-4">
              {linkedinAccounts.map((account) => (
                <SocialAccountCard
                  key={account.id}
                  platform="LinkedIn"
                  icon={<Linkedin className="w-8 h-8 text-[#0077B5]" />}
                  title="LinkedIn profile"
                  isConnected={true}
                  accountName={account.account_name}
                  accountId={account.id}
                  onDisconnect={() => onDisconnect(account.id)}
                >
                  <Button variant="destructive" onClick={() => onDisconnect(account.id)}>
                    Disconnect
                  </Button>
                </SocialAccountCard>
              ))}
            </div>
          </div>
        )}

        {facebookAccounts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Facebook Pages</h3>
            <div className="space-y-4">
              {facebookAccounts.map((account) => (
                <SocialAccountCard
                  key={account.id}
                  platform="Facebook"
                  icon={
                    <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  }
                  title="Facebook page"
                  isConnected={true}
                  accountName={account.account_name}
                  accountId={account.id}
                  onDisconnect={() => onDisconnect(account.id)}
                >
                  <Button variant="destructive" onClick={() => onDisconnect(account.id)}>
                    Disconnect
                  </Button>
                </SocialAccountCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};