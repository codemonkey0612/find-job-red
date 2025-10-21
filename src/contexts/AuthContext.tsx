import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { authApi, type User, type UpdateProfileRequest, type ChangePasswordRequest } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: UpdateProfileRequest) => Promise<void>;
  changePassword: (passwordData: ChangePasswordRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
  setAuthData: (user: User, token: string) => void;
  isAuthenticated: () => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'employer';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from cookies/localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = Cookies.get('auth_token') || localStorage.getItem('auth_token');
        
        if (savedToken) {
          setToken(savedToken);
          
          // Verify token and get user data
          try {
            const userData = await authApi.getProfile(savedToken);
            setUser(userData.data.data.user);
          } catch (error) {
            // Token is invalid, clear it
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    authApi.clearAuth();
    Cookies.remove('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.login(email, password);
      
      const { user: userData, token: authToken } = response.data.data;
      
      setUser(userData);
      setToken(authToken);
      
      // Store in cookies and localStorage
      Cookies.set('auth_token', authToken, { expires: 7, secure: true, sameSite: 'strict' });
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const response = await authApi.register(userData);
      
      const { user: newUser, token: authToken } = response.data.data;
      
      setUser(newUser);
      setToken(authToken);
      
      // Store in cookies and localStorage
      Cookies.set('auth_token', authToken, { expires: 7, secure: true, sameSite: 'strict' });
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      // Even if API call fails, we should still clear local auth
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local auth data and navigate
      clearAuth();
      navigate('/');
    }
  };

  const updateProfile = async (profileData: UpdateProfileRequest) => {
    try {
      await authApi.updateProfile(profileData);
      
      // Refresh user data from server to get latest profile
      if (token) {
        const response = await authApi.getProfile(token);
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const changePassword = async (passwordData: ChangePasswordRequest) => {
    try {
      await authApi.changePassword(passwordData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken();
      const { token: newToken } = response.data.data;
      
      setToken(newToken);
      Cookies.set('auth_token', newToken, { expires: 7, secure: true, sameSite: 'strict' });
      localStorage.setItem('auth_token', newToken);
      
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      clearAuth();
      throw new Error('Session expired. Please login again.');
    }
  };

  const isAuthenticated = () => {
    return authApi.isAuthenticated();
  };

  const setAuthData = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    
    // Store in cookies and localStorage
    Cookies.set('auth_token', authToken, { expires: 7, secure: true, sameSite: 'strict' });
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    setAuthData,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
