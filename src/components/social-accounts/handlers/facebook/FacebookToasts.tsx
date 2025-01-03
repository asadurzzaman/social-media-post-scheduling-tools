import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

export const showFacebookError = (message: string, description?: string) => {
  toast.error(message, {
    description: (
      <Alert variant="destructive" className="border-red-500">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="pr-8">{description || message}</AlertDescription>
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

export const showFacebookSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description: (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Success</AlertTitle>
        <AlertDescription className="text-green-700 pr-8">
          {description || message}
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