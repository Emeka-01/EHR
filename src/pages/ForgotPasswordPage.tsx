import React, { useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ViewState } from '../types';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PASSWORD_RESET_TOKEN_KEY = 'passwordResetToken';

interface ForgotPasswordPageProps {
  onNavigate: (view: ViewState) => void;
}
export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const resetToken = await requestPasswordReset(email);
      sessionStorage.setItem(PASSWORD_RESET_TOKEN_KEY, resetToken);
      onNavigate('reset-password');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to confirm email address.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Confirm your email to continue">

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required />

        {error &&
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </p>
        }

        <Button type="submit" fullWidth isLoading={isLoading}>
          Confirm Email
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">

            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </button>
        </div>
      </form>
    </AuthLayout>);

}