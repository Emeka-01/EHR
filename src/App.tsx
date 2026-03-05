import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/Toast';
import { AppLayout } from './components/AppLayout';
import { ViewState } from './types';
// Pages
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { OTPPage } from './pages/OTPPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { UpdateProfilePage } from './pages/UpdateProfilePage';
import { AppointmentPage } from './pages/AppointmentPage';
import { MedicalResultsPage } from './pages/MedicalResultsPage';
import { UploadHistoryPage } from './pages/UploadHistoryPage';

const EMAIL_VERIFICATION_TOKEN_KEY = 'emailVerificationToken';
const PASSWORD_RESET_TOKEN_KEY = 'passwordResetToken';

function AppContent() {
  const { isAuthenticated, toasts, removeToast } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('login');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verifyToken');
    const resetToken = params.get('resetToken');

    if (!verifyToken && !resetToken) {
      return;
    }

    if (resetToken) {
      sessionStorage.setItem(PASSWORD_RESET_TOKEN_KEY, resetToken);
      setCurrentView('reset-password');
    } else if (verifyToken) {
      sessionStorage.setItem(EMAIL_VERIFICATION_TOKEN_KEY, verifyToken);
      setCurrentView('verify-email');
    }

    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  // Redirect to dashboard on login
  useEffect(() => {
    if (
    isAuthenticated &&
    [
    'login',
    'signup',
    'verify-email',
    'otp',
    'forgot-password',
    'reset-password'].
    includes(currentView))
    {
      setCurrentView('dashboard');
    } else if (
    !isAuthenticated &&
    ![
    'login',
    'signup',
    'verify-email',
    'otp',
    'forgot-password',
    'reset-password'].
    includes(currentView))
    {
      setCurrentView('login');
    }
  }, [isAuthenticated]);
  const renderContent = () => {
    if (!isAuthenticated) {
      switch (currentView) {
        case 'signup':
          return <SignUpPage onNavigate={setCurrentView} />;
        case 'verify-email':
          return <EmailVerificationPage onNavigate={setCurrentView} />;
        case 'otp':
          return <OTPPage onNavigate={setCurrentView} />;
        case 'forgot-password':
          return <ForgotPasswordPage onNavigate={setCurrentView} />;
        case 'reset-password':
          return <ResetPasswordPage onNavigate={setCurrentView} />;
        default:
          return <LoginPage onNavigate={setCurrentView} />;
      }
    }
    // Protected Views
    const renderProtectedPage = () => {
      switch (currentView) {
        case 'profile':
          return <UpdateProfilePage />;
        case 'appointments':
          return <AppointmentPage />;
        case 'medical-results':
          return <MedicalResultsPage />;
        case 'upload-history':
          return <UploadHistoryPage />;
        default:
          return <DashboardPage onNavigate={setCurrentView} />;
      }
    };
    return (
      <AppLayout currentView={currentView} onNavigate={setCurrentView}>
        {renderProtectedPage()}
      </AppLayout>);

  };
  return (
    <>
      {renderContent()}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>);

}
export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>);

}