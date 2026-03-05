import { useEffect, useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';
import { ViewState } from '../types';
import { MailCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMAIL_VERIFICATION_TOKEN_KEY = 'emailVerificationToken';

interface EmailVerificationPageProps {
  onNavigate: (view: ViewState) => void;
}
export function EmailVerificationPage({
  onNavigate
}: EmailVerificationPageProps) {
  const { verifyEmail, resendVerificationEmail, pendingVerificationEmail } =
  useAuth();
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  const [verificationToken] = useState<string | null>(() =>
  sessionStorage.getItem(EMAIL_VERIFICATION_TOKEN_KEY)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (!verificationToken) {
      setError(
        'No verification token was found. Open the verification link from your email.'
      );
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await verifyEmail(verificationToken);
      sessionStorage.removeItem(EMAIL_VERIFICATION_TOKEN_KEY);
      onNavigate('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify email.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!pendingVerificationEmail) {
      setError('Please sign up again to request a verification email.');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      await resendVerificationEmail(pendingVerificationEmail);
      setCountdown(60);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to resend verification email.'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="We've sent a secure link to your inbox">

      <div className="text-center py-6">
        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <MailCheck className="h-10 w-10 text-blue-600" />
        </div>

        <p className="text-gray-600 mb-8">
          Please click the link in the email we just sent you to activate your
          account. If you don't see it, check your spam folder.
        </p>

        <div className="space-y-4">
          <Button
            onClick={handleVerify}
            fullWidth
            isLoading={isVerifying}
            disabled={!verificationToken}>

            Complete Email Verification
          </Button>

          <Button
            onClick={handleResend}
            variant="ghost"
            fullWidth
            disabled={countdown > 0 || isResending}
            className="text-sm">

            {countdown > 0 ?
            <span className="text-gray-400">
                Resend email in {countdown}s
              </span> :

            <span className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4" /> Resend Verification Email
              </span>
            }
          </Button>

          {error &&
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </p>
          }
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-gray-500 hover:text-gray-900">

            Back to Sign In
          </button>
        </div>
      </div>
    </AuthLayout>);

}