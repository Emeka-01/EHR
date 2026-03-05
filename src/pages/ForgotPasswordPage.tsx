import React, { useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ViewState } from '../types';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ForgotPasswordPageProps {
  onNavigate: (view: ViewState) => void;
}
export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <AuthLayout title="Check Your Email" subtitle="Reset link sent">
        <div className="text-center py-4">
          <p className="text-gray-600 mb-6">
            If an account exists for <strong>{email}</strong>, you will receive
            a password reset link shortly.
          </p>
          <Button onClick={() => onNavigate('login')} fullWidth>
            Back to Sign In
          </Button>
        </div>
      </AuthLayout>);

  }
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive instructions">

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required />


        <Button type="submit" fullWidth isLoading={isLoading}>
          Send Reset Link
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