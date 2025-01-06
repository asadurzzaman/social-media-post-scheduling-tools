import { supabase } from "@/integrations/supabase/client";

export const updateTokenInDatabase = async (accessToken: string, expiresIn: number) => {
  try {
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (!session) {
      console.error('No valid session found');
      throw new Error('No valid session found');
    }

    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);

    const { error } = await supabase
      .from('social_accounts')
      .update({
        access_token: accessToken,
        token_expires_at: expirationDate.toISOString()
      })
      .eq('platform', 'facebook');

    if (error) {
      console.error('Error updating token in database:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update token in database:', error);
    throw error;
  }
};