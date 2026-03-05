import React, { useEffect, useState, useRef } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';
import { ViewState } from '../types';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface OTPPageProps {
  onNavigate: (view: ViewState) => void;
}
export function OTPPage({ onNavigate }: OTPPageProps) {
  const { verifyOtp, resendOtp, otpEmail } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setIsLoading(true);
    setError('');

    const success = await verifyOtp(code);
    setIsLoading(false);

    if (success) {
      onNavigate('dashboard');
      return;
    }

    setError('Invalid OTP code or code expired.');
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      await resendOtp();
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Security Verification"
      subtitle="Enter the code sent to your email">

      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
        </div>
        <p className="text-sm text-gray-500">
          For your security, we've sent a One-Time Password (OTP) to your
          registered email.
        </p>
        {otpEmail &&
        <p className="text-xs text-blue-600 mt-2 bg-blue-50 inline-block px-2 py-1 rounded">
            Sent to {otpEmail}
          </p>
        }
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-center gap-2 sm:gap-4">
          {otp.map((digit, index) =>
          <input
            key={index}
            ref={(el) => inputRefs.current[index] = el}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />

          )}
        </div>

        {error && <p className="text-center text-red-600 text-sm">{error}</p>}

        <Button type="submit" fullWidth isLoading={isLoading}>
          Verify & Sign In
        </Button>

        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="text-sm">

          {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-gray-500 hover:text-gray-900">

            Back to Login
          </button>
        </div>
      </form>
    </AuthLayout>);

}