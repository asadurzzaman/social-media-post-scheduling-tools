import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LandingNav } from "@/components/LandingNav";
import { Footer } from "@/components/Footer";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Welcome Back</h1>
          <div className="bg-card p-8 rounded-lg shadow-md">
            <Auth
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
                className: {
                  container: 'w-full',
                  button: 'w-full',
                  anchor: 'text-primary hover:text-primary/80',
                },
              }}
              view="sign_in"
              showLinks={false}
              providers={["facebook"]}
              redirectTo={`${window.location.origin}/dashboard`}
            />
          </div>
          <p className="text-center mt-4 text-sm text-gray-600">
            New to SocialManager? Visit our{" "}
            <a href="/pricing" className="text-primary hover:underline">
              pricing page
            </a>{" "}
            to get started.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;