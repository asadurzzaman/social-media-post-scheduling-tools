import React, { useEffect, useState } from 'react';
import { Linkedin } from 'lucide-react';
import { toast } from "sonner";

interface LinkedInLoginButtonProps {
  clientId: string;
  onSuccess: (response: { accessToken: string; userId: string }) => void;
  onError: (error: string) => void;
}

const LinkedInLoginButton: React.FC<LinkedInLoginButtonProps> = ({
  clientId,
  onSuccess,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load LinkedIn SDK
    const script = document.createElement('script');
    script.src = "https://platform.linkedin.com/in.js";
    script.type = "text/javascript";
    script.innerHTML = `api_key: ${clientId}\n`;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [clientId]);

  const handleLinkedInLogin = async () => {
    setIsProcessing(true);
    try {
      // @ts-ignore - LinkedIn SDK types
      window.IN.User.authorize(() => {
        // @ts-ignore - LinkedIn SDK types
        window.IN.API.Profile("me").fields([
          "id",
          "firstName",
          "lastName",
          "profilePicture",
          "email-address"
        ]).result((profiles: any) => {
          const profile = profiles.values[0];
          // @ts-ignore - LinkedIn SDK types
          const accessToken = window.IN.ENV.auth.oauth_token;
          
          onSuccess({
            accessToken,
            userId: profile.id
          });
        }).error((error: any) => {
          console.error('LinkedIn API error:', error);
          onError('Failed to get LinkedIn profile');
        });
      });
    } catch (error) {
      console.error('LinkedIn login error:', error);
      onError('Failed to connect with LinkedIn');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleLinkedInLogin}
      disabled={isProcessing}
      className={`
        flex items-center justify-center gap-2 
        px-4 py-2 rounded
        ${isProcessing ? 'bg-gray-400' : 'bg-[#0077B5] hover:bg-[#006699]'}
        text-white font-medium
        transition-colors
        w-full max-w-sm
      `}
    >
      <Linkedin className="w-5 h-5" />
      {isProcessing ? 'Processing...' : 'Continue with LinkedIn'}
    </button>
  );
};

export default LinkedInLoginButton;