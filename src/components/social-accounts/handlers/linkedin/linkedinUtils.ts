import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const showSuccessToast = () => {
  toast.success("LinkedIn account connected", {
    description: (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Success</AlertTitle>
        <AlertDescription className="text-green-700 pr-8">
          Successfully connected LinkedIn account
        </AlertDescription>
        <Button 
          size="sm" 
          variant="ghost" 
          className="absolute right-2 top-2 hover:bg-green-50"
          onClick={() => toast.dismiss()}
        >
          <X className="h-4 w-4 text-green-600" />
        </Button>
      </Alert>
    ),
  });
};

export const showErrorToast = (message: string) => {
  toast.error("LinkedIn connection failed", {
    description: (
      <Alert variant="destructive" className="border-red-500">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="pr-8">{message}</AlertDescription>
        <Button 
          size="sm" 
          variant="ghost" 
          className="absolute right-2 top-2 hover:bg-red-50"
          onClick={() => toast.dismiss()}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    ),
  });
};

export const checkExistingLinkedInAccount = async (profileId: string) => {
  const { data: existingAccounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('platform', 'linkedin')
    .eq('page_id', profileId);

  return existingAccounts && existingAccounts.length > 0;
};

export const saveLinkedInAccount = async (
  userId: string,
  accountName: string,
  accessToken: string,
  profileId: string,
  expiresIn: number
) => {
  const { error: insertError } = await supabase
    .from('social_accounts')
    .insert({
      user_id: userId,
      platform: 'linkedin',
      account_name: accountName,
      access_token: accessToken,
      page_id: profileId,
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });

  if (insertError) throw insertError;
};