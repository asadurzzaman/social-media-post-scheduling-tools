import { Facebook, Instagram, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string;
}

interface SocialAccountSelectProps {
  accounts?: SocialAccount[];
  selectedAccounts: string[];
  onSelect: (accountIds: string[]) => void;
}

export const SocialAccountSelect = ({
  accounts = [],
  selectedAccounts = [],
  onSelect,
}: SocialAccountSelectProps) => {
  // Ensure accounts is an array before filtering
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  
  const facebookAccounts = safeAccounts.filter(account => account.platform === 'facebook');
  const instagramAccounts = safeAccounts.filter(account => account.platform === 'instagram');

  const handleSelect = (accountId: string) => {
    onSelect([accountId]); // Now only passing a single account ID
  };

  // Find the selected account name for display
  const selectedAccount = safeAccounts.find(account => account.id === selectedAccounts[0]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Select Social Media Account <span className="text-red-500">*</span>
      </Label>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              selectedAccounts.length > 0 && "text-primary"
            )}
          >
            {selectedAccount ? (
              <div className="flex items-center gap-2">
                {selectedAccount.platform === 'facebook' && (
                  <Facebook className="h-4 w-4 text-[#1877F2]" />
                )}
                {selectedAccount.platform === 'instagram' && (
                  <Instagram className="h-4 w-4 text-[#E4405F]" />
                )}
                <span>{selectedAccount.account_name}</span>
              </div>
            ) : (
              "Select an account"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search accounts..." />
            <CommandEmpty>No accounts found.</CommandEmpty>
            {facebookAccounts.length > 0 && (
              <CommandGroup heading="Facebook Pages">
                {facebookAccounts.map((account) => (
                  <CommandItem
                    key={account.id}
                    value={account.account_name}
                    onSelect={() => handleSelect(account.id)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Facebook className="h-4 w-4 text-[#1877F2]" />
                      <span>{account.account_name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedAccounts[0] === account.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {instagramAccounts.length > 0 && (
              <CommandGroup heading="Instagram Accounts">
                {instagramAccounts.map((account) => (
                  <CommandItem
                    key={account.id}
                    value={account.account_name}
                    onSelect={() => handleSelect(account.id)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Instagram className="h-4 w-4 text-[#E4405F]" />
                      <span>{account.account_name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedAccounts[0] === account.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {safeAccounts.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No social media accounts connected. Please connect an account first.
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};