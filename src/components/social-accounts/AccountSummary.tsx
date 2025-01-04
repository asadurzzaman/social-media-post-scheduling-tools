import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string;
}

interface AccountSummaryProps {
  instagramAccounts: SocialAccount[];
  linkedinAccounts: SocialAccount[];
}

export const AccountSummary = ({ instagramAccounts = [], linkedinAccounts = [] }: AccountSummaryProps) => {
  const totalAccounts = (instagramAccounts?.length || 0) + (linkedinAccounts?.length || 0);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Connected Accounts Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Accounts</p>
          <p className="text-2xl font-bold">{totalAccounts}</p>
        </div>
        <div className="p-4 bg-[#E4405F]/10 rounded-lg">
          <p className="text-sm text-muted-foreground">Instagram Accounts</p>
          <p className="text-2xl font-bold">{instagramAccounts?.length || 0}</p>
          {instagramAccounts?.length > 0 && (
            <ScrollArea className="h-20 mt-2">
              <div className="space-y-1">
                {instagramAccounts.map((account) => (
                  <p key={account.id} className="text-sm text-muted-foreground">
                    {account.account_name}
                  </p>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <div className="p-4 bg-[#0A66C2]/10 rounded-lg">
          <p className="text-sm text-muted-foreground">LinkedIn Accounts</p>
          <p className="text-2xl font-bold">{linkedinAccounts?.length || 0}</p>
          {linkedinAccounts?.length > 0 && (
            <ScrollArea className="h-20 mt-2">
              <div className="space-y-1">
                {linkedinAccounts.map((account) => (
                  <p key={account.id} className="text-sm text-muted-foreground">
                    {account.account_name}
                  </p>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </Card>
  );
};