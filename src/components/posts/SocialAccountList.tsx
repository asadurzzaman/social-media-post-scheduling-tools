import { Facebook, Instagram } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string;
}

interface SocialAccountListProps {
  accounts: SocialAccount[];
  selectedAccount: string;
  onSelect: (accountId: string) => void;
}

export const SocialAccountList = ({
  accounts,
  selectedAccount,
  onSelect,
}: SocialAccountListProps) => {
  const facebookAccounts = accounts.filter(account => account.platform === 'facebook');
  const instagramAccounts = accounts.filter(account => account.platform === 'instagram');

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Select Social Media Account <span className="text-red-500">*</span>
      </Label>
      
      <Select value={selectedAccount} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an account" />
        </SelectTrigger>
        <SelectContent>
          {facebookAccounts.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-sm font-semibold">Facebook Pages</div>
              {facebookAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-[#1877F2]" />
                    <span>{account.account_name}</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
          
          {instagramAccounts.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-sm font-semibold">Instagram Accounts</div>
              {instagramAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-[#E4405F]" />
                    <span>{account.account_name}</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}

          {accounts.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No social media accounts connected. Please connect an account first.
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};