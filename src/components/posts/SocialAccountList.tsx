import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Linkedin, Youtube, Instagram, Twitter } from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
}

interface SocialAccountListProps {
  accounts?: SocialAccount[];
  selectedAccounts?: string[];
  onSelect?: (accountIds: string[]) => void;
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

export const SocialAccountList = ({ 
  accounts = [], 
  selectedAccounts = [], 
  onSelect 
}: SocialAccountListProps) => {
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
      default:
        return null;
    }
  };

  const displayAccounts = accounts.length > 0 ? accounts : demoAccounts;
  const currentSelectedAccounts = Array.isArray(selectedAccounts) ? selectedAccounts : [];

  const handleSelect = (accountId: string) => {
    if (!onSelect) return;
    
    const newSelectedAccounts = currentSelectedAccounts.includes(accountId)
      ? currentSelectedAccounts.filter(id => id !== accountId)
      : [...currentSelectedAccounts, accountId];
    
    onSelect(newSelectedAccounts);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Select Social Media Accounts <span className="text-red-500">*</span>
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {currentSelectedAccounts.length === 0 ? (
              "Select accounts..."
            ) : (
              `${currentSelectedAccounts.length} account${currentSelectedAccounts.length === 1 ? '' : 's'} selected`
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" side="bottom">
          <Command>
            <CommandInput placeholder="Search accounts..." />
            <CommandEmpty>No accounts found.</CommandEmpty>
            <CommandGroup>
              {displayAccounts.map((account) => (
                <CommandItem
                  key={account.id}
                  value={account.id}
                  onSelect={() => handleSelect(account.id)}
                  className="flex items-center gap-3 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                >
                  <div className="flex items-center gap-3 w-full">
                    {getPlatformIcon(account.platform)}
                    <span className="font-medium">{account.account_name}</span>
                    {accounts.length === 0 && (
                      <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">Demo</span>
                    )}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        currentSelectedAccounts.includes(account.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          These are demo accounts. Connect your social media accounts to start posting.
        </p>
      )}
    </div>
  );
};