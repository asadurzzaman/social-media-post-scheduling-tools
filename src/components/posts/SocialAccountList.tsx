import { Facebook, Instagram } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

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
  
  console.log('Facebook accounts:', facebookAccounts);
  console.log('Instagram accounts:', instagramAccounts);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Select Social Media Account <span className="text-red-500">*</span>
      </Label>
      <RadioGroup
        value={selectedAccount}
        onValueChange={onSelect}
        className="space-y-2"
      >
        {facebookAccounts.map((account) => (
          <div
            key={account.id}
            className={cn(
              "flex items-center space-x-3 rounded-lg border p-4",
              selectedAccount === account.id
                ? "border-primary bg-primary/5"
                : "border-input"
            )}
          >
            <RadioGroupItem value={account.id} id={account.id} />
            <Label
              htmlFor={account.id}
              className="flex flex-1 items-center space-x-3 cursor-pointer"
            >
              <Facebook className="h-5 w-5 text-[#1877F2]" />
              <span>{account.account_name}</span>
            </Label>
          </div>
        ))}

        {instagramAccounts.map((account) => (
          <div
            key={account.id}
            className={cn(
              "flex items-center space-x-3 rounded-lg border p-4",
              selectedAccount === account.id
                ? "border-primary bg-primary/5"
                : "border-input"
            )}
          >
            <RadioGroupItem value={account.id} id={account.id} />
            <Label
              htmlFor={account.id}
              className="flex flex-1 items-center space-x-3 cursor-pointer"
            >
              <Instagram className="h-5 w-5 text-[#E4405F]" />
              <span>{account.account_name}</span>
            </Label>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No social media accounts connected. Please connect an account first.
          </div>
        )}
      </RadioGroup>
    </div>
  );
};