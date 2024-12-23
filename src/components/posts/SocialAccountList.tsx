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

export const SocialAccountList = ({ accounts, selectedAccount, onSelect }: SocialAccountListProps) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="h-5 w-5" />;
      case 'youtube':
        return <Youtube className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return 'bg-[#0077B5] hover:bg-[#006399]';
      case 'youtube':
        return 'bg-[#FF0000] hover:bg-[#CC0000]';
      case 'instagram':
        return 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90';
      case 'twitter':
        return 'bg-[#1DA1F2] hover:bg-[#1A91DA]';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Select Social Media Account <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2">
        {accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => onSelect(account.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white transition-all",
              getPlatformColor(account.platform),
              selectedAccount === account.id ? 'ring-2 ring-offset-2 ring-black' : ''
            )}
          >
            {getPlatformIcon(account.platform)}
            <span className="font-medium">{account.account_name}</span>
          </button>
        ))}
        {accounts.length === 0 && (
          <p className="text-sm text-muted-foreground">No social media accounts connected yet.</p>
        )}
      </div>
    </div>
  );
};