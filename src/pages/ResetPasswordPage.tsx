import React, { useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { ViewState } from '../types';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PASSWORD_RESET_TOKEN_KEY = 'passwordResetToken';

interface ResetPasswordPageProps {
  onNavigate: (view: ViewState) => void;
}
export function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken] = useState<string | null>(() =>
  sessionStorage.getItem(PASSWORD_RESET_TOKEN_KEY)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken) {
      setError('Reset token is missing or expired. Please request a new reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await resetPassword(resetToken, password);
      sessionStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
      onNavigate('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        title="Email Confirmation Required"
        subtitle="Confirm your email first to reset password">

        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Please confirm your account email first before setting a new password.
          </p>
          <Button onClick={() => onNavigate('forgot-password')} fullWidth>
            Confirm Email
          </Button>
        </div>
      </AuthLayout>);

  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Create a strong password for your account">

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600">

            {showPassword ?
            <EyeOff className="h-5 w-5" /> :

            <Eye className="h-5 w-5" />
            }
          </button>
          <PasswordStrengthMeter password={password} />
        </div>

        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          required />


        {error &&
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </p>
        }

        <Button type="submit" fullWidth isLoading={isLoading}>
          Update Password
        </Button>
      </form>
    </AuthLayout>);

}