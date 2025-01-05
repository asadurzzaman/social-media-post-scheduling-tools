import { Card } from "@/components/ui/card";

interface AccountsSummaryProps {
  totalAccounts: number;
  instagramAccounts: number;
  linkedinAccounts: number;
}

export const AccountsSummary = ({ totalAccounts, instagramAccounts, linkedinAccounts }: AccountsSummaryProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Connected Accounts Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-blue-50/50">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Accounts</p>
            <p className="text-3xl font-bold">{totalAccounts}</p>
          </div>
        </Card>
        <Card className="p-6 bg-pink-50/50">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Instagram Accounts</p>
            <p className="text-3xl font-bold">{instagramAccounts}</p>
          </div>
        </Card>
        <Card className="p-6 bg-blue-50/50">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">LinkedIn Accounts</p>
            <p className="text-3xl font-bold">{linkedinAccounts}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};