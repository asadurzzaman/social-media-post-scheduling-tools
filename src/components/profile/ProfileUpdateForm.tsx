import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimezonePicker } from "@/components/posts/TimezonePicker";

interface ProfileUpdateFormProps {
  profile: {
    id?: string;
    full_name?: string;
    email?: string;
    timezone?: string;
  } | null;
  onUpdate: () => void;
}

export const ProfileUpdateForm = ({ profile, onUpdate }: ProfileUpdateFormProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile?.id) {
      toast.error('Profile ID is missing');
      return;
    }
    
    setIsUpdating(true);

    const formData = new FormData(e.currentTarget);
    const updates = {
      id: profile.id, // Add the required id field
      full_name: String(formData.get('fullName')),
      email: String(formData.get('email')),
      timezone: String(formData.get('timezone')),
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      onUpdate();
    } catch (error) {
      toast.error('Error updating profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={profile?.full_name || ''}
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={profile?.email || ''}
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <TimezonePicker
            value={profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
            onChange={(timezone) => {
              const timezoneInput = document.querySelector('input[name="timezone"]') as HTMLInputElement;
              if (timezoneInput) {
                timezoneInput.value = timezone;
              }
            }}
          />
          <input type="hidden" name="timezone" defaultValue={profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone} />
          <p className="text-sm text-muted-foreground mt-1">
            Times are shown in {profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
          <p className="text-sm text-muted-foreground">
            This timezone will be used for all your scheduled posts
          </p>
        </div>

        <Button type="submit" disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Card>
  );
};