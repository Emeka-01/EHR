import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ViewState } from '../types';
import { Eye, EyeOff, Lock } from 'lucide-react';
interface LoginPageProps {
  onNavigate: (view: ViewState) => void;
}
export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, lockUntil } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isLocked = lockUntil && Date.now() < lockUntil;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        onNavigate('dashboard');
      } else {
        if (isLocked) {
          setError('Account locked. Please try again later.');
        } else {
          setError('Invalid username or password.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  if (isLocked) {
    return (
      <AuthLayout title="Account Locked" subtitle="Too many failed attempts">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Security Lockout
          </h3>
          <p className="text-gray-600 mb-6">
            Your account has been temporarily locked for 30 minutes due to
            multiple failed login attempts.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Please check your email for an OTP to unlock your account
            immediately.
          </p>
          <Button onClick={() => onNavigate('otp')} fullWidth>
            Enter OTP
          </Button>
        </div>
      </AuthLayout>);

  }
  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to access your portal">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          autoComplete="email" />


        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password" />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600">

            {showPassword ?
            <EyeOff className="h-5 w-5" /> :

            <Eye className="h-5 w-5" />
            }
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />

            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900">

              Remember me
            </label>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('forgot-password')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500">

            Forgot password?
          </button>
        </div>

        {error &&
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        }

        <Button type="submit" fullWidth isLoading={isLoading}>
          Sign In
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('signup')}
            className="font-medium text-blue-600 hover:text-blue-500">

            Sign up
          </button>
        </p>
      </form>
    </AuthLayout>);

}