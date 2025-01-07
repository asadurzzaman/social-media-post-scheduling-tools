import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileUpdateForm } from "@/components/profile/ProfileUpdateForm";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Settings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [showPlatformSelection, setShowPlatformSelection] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setProfile(profile);
          setShowPlatformSelection(profile.post_platform_selection || false);
        }
      }
    };

    getProfile();
  }, []);

  const updatePlatformSelection = async (value: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          id: user.id,
          post_platform_selection: value 
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Preference updated successfully');
      setShowPlatformSelection(value);
    } catch (error) {
      console.error('Error updating platform selection:', error);
      toast.error('Failed to update preference');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Profile Settings</h3>
            <ProfileUpdateForm 
              profile={profile} 
              onUpdate={() => {
                // Refresh profile data
                if (user) {
                  supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                    .then(({ data }) => {
                      if (data) setProfile(data);
                    });
                }
              }} 
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Post Settings</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="platform-selection"
                checked={showPlatformSelection}
                onCheckedChange={updatePlatformSelection}
              />
              <Label htmlFor="platform-selection">
                Show platform selection when creating posts
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              When enabled, you'll be asked to choose which platforms to post to when creating a new post
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;