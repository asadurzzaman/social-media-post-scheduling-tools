import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('No token provided');
        }

        // Verify token and get subscription details
        const { data: tokenData, error: tokenError } = await supabase
          .from('subscription_tokens')
          .select('*')
          .eq('token', token)
          .single();

        if (tokenError || !tokenData) {
          throw new Error('Invalid or expired token');
        }

        // Generate a random password and create user
        const password = crypto.randomUUID();
        const email = `user_${crypto.randomUUID()}@temp.com`;

        // Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // Delete the used token
        await supabase
          .from('subscription_tokens')
          .delete()
          .eq('token', token);

        toast.success('Account created successfully! Welcome to SocialManager');
        navigate('/dashboard');
      } catch (error) {
        console.error('Auto-login error:', error);
        toast.error('Failed to create account. Please try again.');
        navigate('/pricing');
      } finally {
        setIsProcessing(false);
      }
    };

    autoLogin();
  }, [navigate, searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;