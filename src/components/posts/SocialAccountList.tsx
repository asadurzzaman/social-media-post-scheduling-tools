import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Linkedin, Youtube, Instagram, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
}

interface SocialAccountListProps {
  accounts: SocialAccount[];
  selectedAccount: string;
  onSelect: (accountId: string) => void;
}

const demoAccounts = [
  {
    id: 'demo-linkedin',
    platform: 'linkedin',
    account_name: 'Demo LinkedIn Page'
  },
  {
    id: 'demo-youtube',
    platform: 'youtube',
    account_name: 'Demo YouTube Channel'
  },
  {
    id: 'demo-instagram',
    platform: 'instagram',
    account_name: 'Demo Instagram Profile'
  },
  {
    id: 'demo-twitter',
    platform: 'twitter',
    account_name: 'Demo Twitter Account'
  }
];

export const SocialAccountList = ({ accounts, selectedAccount, onSelect }: SocialAccountListProps) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const displayAccounts = accounts.length > 0 ? accounts : demoAccounts;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Select Social Media Account <span className="text-red-500">*</span>
      </label>
      <Select value={selectedAccount} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an account" />
        </SelectTrigger>
        <SelectContent>
          {displayAccounts.map((account) => (
            <SelectItem 
              key={account.id} 
              value={account.id}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                {getPlatformIcon(account.platform)}
                <span>{account.account_name}</span>
                {accounts.length === 0 && (
                  <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">Demo</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          These are demo accounts. Connect your social media accounts to start posting.
        </p>
      )}
    </div>
  );
};