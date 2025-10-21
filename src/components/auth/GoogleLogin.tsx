import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';

interface GoogleLoginProps {
  onSuccess: () => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { setAuthData } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // Debug: Check environment variables
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      console.log('Google Client ID:', clientId);
      
      if (!clientId || clientId === 'your_google_client_id_here') {
        alert('Google ログインが設定されていません。環境変数 VITE_GOOGLE_CLIENT_ID を設定してください。');
        setLoading(false);
        return;
      }

      // Check if Google API is loaded
      if (!window.google) {
        throw new Error('Google API not loaded. Please check your internet connection.');
      }

      console.log('Initializing Google OAuth...');

      // Use Google Identity Services to get access token directly
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (response: any) => {
          try {
            console.log('Google OAuth access token received:', response.access_token);
            
            // Send access token to backend for user info and authentication
            const authResponse = await authApi.googleLogin(response.access_token);
            const { user, token } = authResponse.data.data;

            console.log('Backend authentication successful');
            
            // Set auth data in context
            setAuthData(user, token);
            
            onSuccess();
          } catch (error: any) {
            console.error('Google login backend error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Google login failed';
            alert(`Google login failed: ${errorMessage}`);
          } finally {
            setLoading(false);
          }
        },
        error_callback: (error: any) => {
          console.error('Google OAuth error:', error);
          setLoading(false);
          
          if (error.type === 'popup_closed') {
            // Don't show error for popup closed - user might have cancelled intentionally
            console.log('User closed the Google login popup');
            return;
          }
          
          let errorMessage = 'Google login failed';
          if (error.type === 'access_denied') {
            errorMessage = 'Google login was cancelled';
          } else if (error.type === 'popup_blocked') {
            errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
          } else if (error.type === 'invalid_request') {
            errorMessage = 'Invalid Google login request. Please check your configuration.';
          } else if (error.type) {
            errorMessage = `Google login error: ${error.type}`;
          }
          
          alert(errorMessage);
        }
      });
      
      // Request access token
      tokenClient.requestAccessToken();
    } catch (error: any) {
      console.error('Google login initialization error:', error);
      setLoading(false);
      alert(`Google login error: ${error.message}`);
    }
  };

  // Load Google API script
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google API script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load Google API script');
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Googleでログイン中...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleでログイン
          </>
        )}
      </Button>
      
      {loading && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          ポップアップが表示されます。ポップアップをブロックしている場合は、ブラウザの設定で許可してください。
        </p>
      )}
    </div>
  );
};

export default GoogleLogin;
