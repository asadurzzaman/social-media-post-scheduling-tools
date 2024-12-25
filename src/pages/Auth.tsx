import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/";
  const priceId = location.state?.priceId;

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (priceId) {
            // If there's a priceId, continue with subscription
            const { data, error } = await supabase.functions.invoke('create-checkout', {
              body: { priceId }
            });
            
            if (error) throw error;
            if (data.error) throw new Error(data.error);
            if (!data.url) throw new Error('No checkout URL received');
            
            window.location.href = data.url;
          } else {
            navigate(returnTo);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("Error checking authentication status");
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (priceId) {
          // If there's a priceId, continue with subscription
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { priceId }
          });
          
          if (error) {
            toast.error("Error starting subscription");
            navigate(returnTo);
            return;
          }
          
          if (data.url) {
            window.location.href = data.url;
          } else {
            toast.error("Error creating checkout session");
            navigate(returnTo);
          }
        } else {
          navigate(returnTo);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, returnTo, priceId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {priceId ? 'Create an account to subscribe' : 'Welcome to SocialManager'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {priceId 
              ? "You're just one step away from getting started"
              : "Sign in or create an account to get started"
            }
          </p>
        </div>
        <div className="mt-8">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
            }}
            providers={["facebook"]}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;