import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Linkedin, Youtube, Instagram, Twitter, Facebook } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string | null;
}

interface SocialAccountListProps {
  accounts?: SocialAccount[];
  selectedAccounts?: string[];
  onSelect?: (accountIds: string[]) => void;
}

const demoAccounts: SocialAccount[] = [
  {
    id: 'demo-linkedin',
    platform: 'linkedin',
    account_name: 'Demo LinkedIn Page',
    avatar_url: null
  },
  {
    id: 'demo-youtube',
    platform: 'youtube',
    account_name: 'Demo YouTube Channel',
    avatar_url: null
  },
  {
    id: 'demo-instagram',
    platform: 'instagram',
    account_name: 'Demo Instagram Profile',
    avatar_url: null
  },
  {
    id: 'demo-twitter',
    platform: 'twitter',
    account_name: 'Demo Twitter Account',
    avatar_url: null
  }
];

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return <Linkedin className="h-6 w-6 text-[#0077B5]" />;
    case 'youtube':
      return <Youtube className="h-6 w-6 text-[#FF0000]" />;
    case 'instagram':
      return <Instagram className="h-6 w-6 text-[#E4405F]" />;
    case 'twitter':
      return <Twitter className="h-6 w-6 text-[#1DA1F2]" />;
    case 'facebook':
      return <Facebook className="h-6 w-6 text-[#1877F2]" />;
    default:
      return null;
  }
};

export const SocialAccountList = ({ 
  accounts = [], 
  selectedAccounts = [], 
  onSelect 
}: SocialAccountListProps) => {
  const displayAccounts = accounts.length > 0 ? accounts : demoAccounts;

  const handleSelect = (accountId: string) => {
    if (!onSelect) return;
    
    const newSelectedAccounts = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter(id => id !== accountId)
      : [...selectedAccounts, accountId];
    
    onSelect(newSelectedAccounts);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Select Social Media Accounts <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {displayAccounts.map((account) => (
          <div
            key={account.id}
            onClick={() => handleSelect(account.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors",
              selectedAccounts.includes(account.id) && "bg-accent"
            )}
          >
            <Avatar className="h-10 w-10">
              {account.avatar_url ? (
                <AvatarImage 
                  src={account.avatar_url} 
                  alt={account.account_name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback>
                {getPlatformIcon(account.platform)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{account.account_name}</span>
            {accounts.length === 0 && (
              <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">Demo</span>
            )}
            <Check
              className={cn(
                "ml-auto h-4 w-4",
                selectedAccounts.includes(account.id) ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
        ))}
      </div>
      {accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          These are demo accounts. Connect your social media accounts to start posting.
        </p>
      )}
    </div>
  );
};