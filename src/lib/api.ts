import axios, { AxiosResponse } from 'axios';

// Automatically detect protocol and use appropriate API URL
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, use the same protocol as the page
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // For production on bizresearch.biz, use relative path (same domain)
    // This avoids mixed content issues
    if (hostname === 'bizresearch.biz' || hostname.includes('bizresearch')) {
      return '/api';
    }
    
    // For localhost, use HTTP
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
    
    // Default: use same protocol as current page with port 3001
    return `${protocol}//${hostname}:3001/api`;
  }
  
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const newToken = refreshResponse.data.data.token;
          localStorage.setItem('auth_token', newToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'employer';
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  education?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'employer';
  email_verified: boolean;
  created_at: string;
  phone?: string;
  address?: string;
  bio?: string;
  skills: string[];
  experience_years?: number;
  education?: string;
  resume_url?: string;
  // OAuth fields
  auth_provider?: 'local' | 'google' | 'linkedin';
  provider_id?: string;
  avatar_url?: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_min?: number;
  salary_max?: number;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  work_style: 'remote' | 'hybrid' | 'onsite';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  created_by_name?: string;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  location?: string;
  job_type?: string;
  work_style?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
}

export interface JobApplication {
  id: number;
  job_id: number;
  user_id: number;
  cover_letter?: string;
  resume_url?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at: string;
  job_title?: string;
  company?: string;
  location?: string;
  job_type?: string;
  work_style?: string;
}

// Auth API
export const authApi = {
  login: (email: string, password: string): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> =>
    api.post('/auth/login', { email, password }),

  register: (userData: RegisterRequest): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> =>
    api.post('/auth/register', userData),

  getProfile: (token?: string): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    token 
      ? api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      : api.get('/auth/me'),

  updateProfile: (profileData: UpdateProfileRequest, token?: string): Promise<AxiosResponse<ApiResponse>> =>
    token 
      ? api.put('/auth/profile', profileData, { headers: { Authorization: `Bearer ${token}` } })
      : api.put('/auth/profile', profileData),

  changePassword: (passwordData: ChangePasswordRequest, token?: string): Promise<AxiosResponse<ApiResponse>> =>
    token 
      ? api.put('/auth/change-password', passwordData, { headers: { Authorization: `Bearer ${token}` } })
      : api.put('/auth/change-password', passwordData),

  refreshToken: (token?: string): Promise<AxiosResponse<ApiResponse<{ token: string }>>> =>
    token 
      ? api.post('/auth/refresh', {}, { headers: { Authorization: `Bearer ${token}` } })
      : api.post('/auth/refresh'),

  logout: (token?: string): Promise<AxiosResponse<ApiResponse>> =>
    token 
      ? api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } })
      : api.post('/auth/logout'),

  // Social login endpoints
  googleLogin: (accessToken: string): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> =>
    api.post('/auth/google', { accessToken }),

  linkedinLogin: (accessToken: string): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> =>
    api.post('/auth/linkedin', { accessToken }),

  // Utility methods
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    return !!token;
  },

  getStoredToken: (): string | null => {
    return localStorage.getItem('auth_token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1] || null;
  },

  clearAuth: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

// Jobs API
export const jobsApi = {
  getJobs: (filters?: JobFilters): Promise<AxiosResponse<ApiResponse<{ jobs: Job[]; pagination: any }>>> =>
    api.get('/jobs', { params: filters }),

  getJob: (id: number): Promise<AxiosResponse<ApiResponse<{ job: Job }>>> =>
    api.get(`/jobs/${id}`),

  createJob: (jobData: Omit<Job, 'id' | 'created_by' | 'created_at' | 'updated_at'>, token: string): Promise<AxiosResponse<ApiResponse<{ job: Job }>>> =>
    api.post('/jobs', jobData, { headers: { Authorization: `Bearer ${token}` } }),

  updateJob: (id: number, jobData: Partial<Job>, token: string): Promise<AxiosResponse<ApiResponse<{ job: Job }>>> =>
    api.put(`/jobs/${id}`, jobData, { headers: { Authorization: `Bearer ${token}` } }),

  deleteJob: (id: number, token: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

  applyForJob: (jobId: number, applicationData: { cover_letter?: string; resume_url?: string }, token: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/jobs/${jobId}/apply`, applicationData, { headers: { Authorization: `Bearer ${token}` } }),

  getMyApplications: (token: string): Promise<AxiosResponse<ApiResponse<{ applications: JobApplication[] }>>> =>
    api.get('/jobs/my-applications', { headers: { Authorization: `Bearer ${token}` } }),
};

// Admin API
export const adminApi = {
  getDashboard: (token: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),

  getUsers: (token: string, params?: any): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/admin/users', { 
      headers: { Authorization: `Bearer ${token}` },
      params 
    }),

  getJobs: (token: string, params?: any): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/admin/jobs', { 
      headers: { Authorization: `Bearer ${token}` },
      params 
    }),

  toggleUserVerification: (token: string, userId: number): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/admin/users/${userId}/toggle-verification`, {}, { 
      headers: { Authorization: `Bearer ${token}` } 
    }),

  toggleJobStatus: (token: string, jobId: number): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/admin/jobs/${jobId}/toggle-status`, {}, { 
      headers: { Authorization: `Bearer ${token}` } 
    }),
};

export default api;
