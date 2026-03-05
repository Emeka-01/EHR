import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { Appointment, MedicalResult, ToastMessage, User } from '../types';
import { ApiError, apiRequest } from '../lib/api';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
  lockUntil: number | null;
  loginAttempts: number;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loginAttempts: number;
  lockUntil: number | null;
  otpEmail: string | null;
  pendingVerificationEmail: string | null;
  toasts: ToastMessage[];
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterPayload) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  resendOtp: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  bookAppointment: (
    data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
  ) => Promise<boolean>;
  uploadFile: (file: File) => Promise<void>;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  getAppointments: () => Appointment[];
  getUploads: () => MedicalResult[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authToken';
const CURRENT_USER_KEY = 'currentUser';
const OTP_EMAIL_KEY = 'otpEmail';
const PENDING_EMAIL_KEY = 'pendingVerificationEmail';

const initialAppointments: Record<string, Appointment[]> = {
  'seed-user-1': [
    {
      id: '101',
      userId: 'seed-user-1',
      doctorName: 'Dr. Emily Chen',
      date: '2026-03-15',
      time: '10:00',
      status: 'confirmed',
      createdAt: '2026-02-20T10:00:00'
    },
    {
      id: '102',
      userId: 'seed-user-1',
      doctorName: 'Dr. James Wilson',
      date: '2026-03-22',
      time: '14:00',
      status: 'confirmed',
      createdAt: '2026-02-21T09:30:00'
    }
  ]
};

const initialUploads: Record<string, MedicalResult[]> = {
  'seed-user-1': [
    {
      id: '201',
      userId: 'seed-user-1',
      fileName: 'Blood_Test_Results.pdf',
      fileType: 'PDF',
      fileSize: '1.2 MB',
      uploadDate: '2026-02-10',
      url: '#'
    }
  ]
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [otpEmail, setOtpEmail] = useState<string | null>(
    sessionStorage.getItem(OTP_EMAIL_KEY)
  );
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<
    string | null
  >(sessionStorage.getItem(PENDING_EMAIL_KEY));

  const appointmentsRef = useRef<Record<string, Appointment[]>>(initialAppointments);
  const uploadsRef = useRef<Record<string, MedicalResult[]>>(initialUploads);

  useEffect(() => {
    const storedUser = sessionStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser) as User);
      } catch {
        sessionStorage.removeItem(CURRENT_USER_KEY);
      }
    }

    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      return;
    }

    let isMounted = true;

    const validateSession = async () => {
      try {
        const data = await apiRequest<{ user: User }>('/api/auth/me', {
          method: 'GET',
          token
        });

        if (!isMounted) {
          return;
        }

        setCurrentUser(data.user);
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      } catch {
        if (!isMounted) {
          return;
        }

        setCurrentUser(null);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(CURRENT_USER_KEY);
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).slice(2, 11);
    setToasts((prev) => [...prev, { id, type, message }]);

    window.setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const saveAuthSession = (token: string, user: User) => {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const data = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: pass
        })
      });

      saveAuthSession(data.token, data.user);
      setLoginAttempts(0);
      setLockUntil(null);
      setOtpEmail(null);
      sessionStorage.removeItem(OTP_EMAIL_KEY);
      addToast('success', `Welcome back, ${data.user.name}!`);
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 423) {
          const payload = error.data as {
            lockUntil?: number;
            message?: string;
          };

          const normalizedEmail = email.trim().toLowerCase();
          setOtpEmail(normalizedEmail);
          sessionStorage.setItem(OTP_EMAIL_KEY, normalizedEmail);
          setLockUntil(
            typeof payload.lockUntil === 'number' ? payload.lockUntil : null
          );
          addToast('error', payload.message || error.message);
          return false;
        }

        if (error.status === 401) {
          setLoginAttempts((prev) => prev + 1);
        }

        addToast('error', error.message);
        return false;
      }

      addToast('error', 'Unable to sign in right now.');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setLoginAttempts(0);
    setLockUntil(null);
    setOtpEmail(null);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(OTP_EMAIL_KEY);
    addToast('success', 'Successfully logged out.');
  };

  const register = async (data: RegisterPayload): Promise<boolean> => {
    try {
      const result = await apiRequest<{
        message: string;
        alreadyExists?: boolean;
        emailSent?: boolean;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      setPendingVerificationEmail(null);
      sessionStorage.removeItem(PENDING_EMAIL_KEY);

      if (result.alreadyExists) {
        addToast('info', result.message);
        return true;
      }

      if (result.emailSent === false) {
        addToast('info', result.message);
      } else {
        addToast('success', result.message);
      }
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        addToast('error', error.message);
        return false;
      }

      addToast('error', 'Registration failed. Please try again.');
      return false;
    }
  };

  const verifyEmail = async (token: string) => {
    await apiRequest<{ message: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
    addToast('success', 'Email verified successfully!');
  };

  const resendVerificationEmail = async (email: string) => {
    await apiRequest<{ message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    addToast('info', 'Verification email sent. Please check your inbox.');
  };

  const verifyOtp = async (code: string): Promise<boolean> => {
    if (!otpEmail) {
      addToast('error', 'No OTP session found. Please login again.');
      return false;
    }

    try {
      const data = await apiRequest<AuthResponse>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: otpEmail, code })
      });

      saveAuthSession(data.token, data.user);
      setLockUntil(null);
      setLoginAttempts(0);
      setOtpEmail(null);
      sessionStorage.removeItem(OTP_EMAIL_KEY);
      addToast('success', 'OTP verified. You are now signed in.');
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        addToast('error', error.message);
        return false;
      }

      addToast('error', 'Unable to verify OTP.');
      return false;
    }
  };

  const resendOtp = async () => {
    if (!otpEmail) {
      addToast('error', 'No locked account found.');
      return;
    }

    await apiRequest<{ message: string }>('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email: otpEmail })
    });

    addToast('info', 'A new OTP has been sent to your email.');
  };

  const requestPasswordReset = async (email: string) => {
    await apiRequest<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    addToast('info', 'If the account exists, a reset link has been sent.');
  };

  const resetPassword = async (token: string, password: string) => {
    await apiRequest<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    });

    addToast('success', 'Password updated successfully.');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) {
      return;
    }

    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      addToast('error', 'Session expired. Please sign in again.');
      return;
    }

    const result = await apiRequest<{ user: User }>('/api/auth/profile', {
      method: 'PATCH',
      token,
      body: JSON.stringify(data)
    });

    setCurrentUser(result.user);
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(result.user));
    addToast('success', 'Profile updated successfully.');
  };

  const bookAppointment = async (
    data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (!currentUser) {
      return false;
    }

    const allAppointments = Object.values(appointmentsRef.current).flat();
    const isTaken = allAppointments.some(
      (appointment) =>
        appointment.doctorName === data.doctorName &&
        appointment.date === data.date &&
        appointment.time === data.time
    );

    if (isTaken) {
      addToast('error', 'This time slot is already booked.');
      return false;
    }

    const newAppointment: Appointment = {
      id: Math.random().toString(36).slice(2, 11),
      userId: currentUser.id,
      doctorName: data.doctorName,
      date: data.date,
      time: data.time,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    const userAppointments = appointmentsRef.current[currentUser.id] || [];
    appointmentsRef.current[currentUser.id] = [...userAppointments, newAppointment];

    return true;
  };

  const uploadFile = async (file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (!currentUser) {
      return;
    }

    const newUpload: MedicalResult = {
      id: Math.random().toString(36).slice(2, 11),
      userId: currentUser.id,
      fileName: file.name,
      fileType: file.type.includes('pdf')
        ? 'PDF'
        : file.type.includes('png')
          ? 'PNG'
          : 'JPEG',
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      url: URL.createObjectURL(file)
    };

    const userUploads = uploadsRef.current[currentUser.id] || [];
    uploadsRef.current[currentUser.id] = [...userUploads, newUpload];

    addToast('success', 'File uploaded securely.');
  };

  const getAppointments = () => {
    if (!currentUser) {
      return [];
    }

    return appointmentsRef.current[currentUser.id] || [];
  };

  const getUploads = () => {
    if (!currentUser) {
      return [];
    }

    return uploadsRef.current[currentUser.id] || [];
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        loginAttempts,
        lockUntil,
        otpEmail,
        pendingVerificationEmail,
        toasts,
        login,
        logout,
        register,
        verifyEmail,
        resendVerificationEmail,
        verifyOtp,
        resendOtp,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        bookAppointment,
        uploadFile,
        addToast,
        removeToast,
        getAppointments,
        getUploads
      }}>

      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}