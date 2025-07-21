import { authAPI } from '../services/api';
import api from '../services/api';

// Signup
export const signup = async (userData: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}) => {
  try {
    const response = await authAPI.register({
      full_name: userData.fullName,
      email: userData.email,
      password: userData.password,
      phone: userData.phoneNumber,
      confirm_password: userData.password
    });

    if (response.data && (response.data.message?.includes('successfully') || response.data.user_id)) {
      return { 
        success: true, 
        message: 'Account created successfully',
        user_id: response.data.user_id,
        user: response.data.user
      };
    }
    return {
      success: false,
      message: response.data?.error || 'Signup failed'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Signup failed. Please try again.'
    };
  }
};

// Login
export const login = async (email: string, password: string) => {
  try {
    const response = await authAPI.login(email, password);

    if (response.data.two_factor_required) {
      return {
        two_factor_required: true,
        user_id: response.data.user_id,
        message: response.data.message || '2FA required',
      };
    }

    const { access_token, user } = response.data;
    const mappedUser = {
      ...user,
      profilePicture: user.profile_picture,
    };
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return {
      success: true,
      message: 'Login successful',
      redirectTo,
      user: mappedUser,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Login failed. Please check your credentials.',
    };
  }
};

// Logout
export const logout = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.post('/api/auth/logout').catch((error: any) => {
      // Optionally log error
    });
    window.location.href = '/login';
  } catch (error: any) {
    window.location.href = '/login';
  }
};

// Auth helpers
export const isAuthenticated = (): boolean => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const tokenData = JSON.parse(atob(parts[1]));
    const expirationTime = tokenData.exp * 1000;
    const currentTime = Date.now();
    if (expirationTime <= currentTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    const user = getCurrentUser();
    if (!user || !user.is_verified) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    if (!user.is_verified) return null;
    return user;
  } catch {
    return null;
  }
};

export const hasRole = (role: 'admin' | 'member'): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

export const requireRole = (role: 'admin' | 'member'): boolean => {
  if (!isAuthenticated()) return false;
  return hasRole(role);
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || 'member';
};

// Email verification
export const verifyEmailCode = async (email: string, verificationCode: string) => {
  try {
    const cleanCode = verificationCode.replace(/\s/g, '');
    const response = await authAPI.verifyEmail(email, cleanCode);
    return {
      success: true,
      message: response.data.message || 'Account verified successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Verification failed'
    };
  }
};

export const resendEmailVerificationCode = async (email: string) => {
  try {
    const response = await authAPI.resendVerificationCode(email);
    return {
      success: true,
      message: response.data.message || 'New verification code sent'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to resend code'
    };
  }
};

// Phone verification
export const verifyPhoneCode = async (phone: string, verificationCode: string) => {
  try {
    const response = await authAPI.verifyPhone(phone, verificationCode);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Verification failed'
    };
  }
};

export const resendSmsVerificationCode = async (phone: string) => {
  try {
    const response = await authAPI.resendSmsVerificationCode(phone);
    return {
      success: true,
      message: response.data.message || 'New verification code sent'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to resend code'
    };
  }
};

export async function sendSmsVerificationCode(phone: string) {
  return api.post('/api/auth/send-otp', { phone })
    .then((res: any) => res.data)
    .catch((err: any) => ({ success: false, message: err?.response?.data?.message || 'Failed to send code' }));
}