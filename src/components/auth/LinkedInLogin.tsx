import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';

interface LinkedInLoginProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    IN: any;
  }
}

export const LinkedInLogin: React.FC<LinkedInLoginProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLinkedInLogin = async () => {
    try {
      setLoading(true);

      // Check if LinkedIn API is loaded
      if (!window.IN) {
        throw new Error('LinkedIn API not loaded');
      }

      // Use LinkedIn SDK
      window.IN.User.authorize(() => {
        window.IN.API.Raw("/people/~:(id,first-name,last-name,email-address)").result((result: any) => {
          handleLinkedInCallback(result);
        });
      });
    } catch (error) {
      console.error('LinkedIn login error:', error);
      setLoading(false);
    }
  };

  const handleLinkedInCallback = async (userData: any) => {
    try {
      // Get access token from LinkedIn
      const accessToken = window.IN.ENV.auth.oauth_token;

      // Send to backend for verification and user creation/login
      const authResponse = await authApi.linkedinLogin(accessToken);
      const { user, token } = authResponse.data.data;

      // Store auth data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onSuccess?.();
    } catch (error) {
      console.error('LinkedIn callback error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load LinkedIn API script
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://platform.linkedin.com/in.js';
    script.async = true;
    script.defer = true;
    script.innerHTML = `
      api_key: ${import.meta.env.VITE_LINKEDIN_CLIENT_ID}
      authorize: true
    `;
    document.body.appendChild(script);

    return () => {
      // Clean up script
      const existingScript = document.querySelector('script[src*="linkedin.com/in.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleLinkedInLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )}
      LinkedInでログイン
    </Button>
  );
};

export default LinkedInLogin;
