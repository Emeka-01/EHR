export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  profilePicture?: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorName: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:mm
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface MedicalResult {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'PDF' | 'JPEG' | 'PNG';
  fileSize: string;
  uploadDate: string;
  url: string; // Simulated URL
}

export type ViewState =
'login' |
'signup' |
'verify-email' |
'otp' |
'forgot-password' |
'reset-password' |
'dashboard' |
'profile' |
'appointments' |
'medical-results' |
'upload-history';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}