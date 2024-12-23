import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const PasswordUpdateForm = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPassword(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = String(formData.get('currentPassword'));
    const newPassword = String(formData.get('newPassword'));
    const repeatPassword = String(formData.get('repeatPassword'));

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      setIsChangingPassword(false);
      return;
    }

    if (newPassword !== repeatPassword) {
      toast.error('New passwords do not match');
      setIsChangingPassword(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error('Error updating password');
      console.error('Error updating password:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Update Password</h2>
        <p className="text-muted-foreground">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>

      <form onSubmit={handlePasswordUpdate} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="flex items-center">
            Current Password <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="flex items-center justify-between">
            <div>
              New Password <span className="text-destructive">*</span>
            </div>
            <span className="text-sm text-muted-foreground">min 8 characters</span>
          </Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repeatPassword" className="flex items-center">
            Repeat Password <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="repeatPassword"
            name="repeatPassword"
            type="password"
            required
          />
        </div>

        <Button type="submit" disabled={isChangingPassword}>
          {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Password
        </Button>
      </form>
    </Card>
  );
};