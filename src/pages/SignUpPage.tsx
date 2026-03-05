import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { ViewState } from '../types';
import { Eye, EyeOff } from 'lucide-react';
interface SignUpPageProps {
  onNavigate: (view: ViewState) => void;
}
export function SignUpPage({ onNavigate }: SignUpPageProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitLockRef = useRef(false);
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';else
    if (!/\S+@\S+\.\S+/.test(formData.email))
    newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';else
    if (formData.password.length < 8)
    newErrors.password = 'Password must be at least 8 characters';else
    if (!/[A-Z]/.test(formData.password))
    newErrors.password = 'Must contain an uppercase letter';else
    if (!/[a-z]/.test(formData.password))
    newErrors.password = 'Must contain a lowercase letter';else
    if (!/[0-9]/.test(formData.password))
    newErrors.password = 'Must contain a number';else
    if (!/[^A-Za-z0-9]/.test(formData.password))
    newErrors.password = 'Must contain a special character';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.terms) {
      newErrors.terms = 'You must agree to the Terms & Conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current) return;
    if (!validate()) return;

    submitLockRef.current = true;
    setIsLoading(true);
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      if (success) {
        onNavigate('login');
      }
    } catch (err) {
      setErrors({
        form: 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
      submitLockRef.current = false;
    }
  };
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join MediPortal for secure health access">

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) =>
          setFormData({
            ...formData,
            name: e.target.value
          })
          }
          error={errors.name}
          placeholder="Peter Parker" />


        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) =>
          setFormData({
            ...formData,
            email: e.target.value
          })
          }
          error={errors.email}
          placeholder="name@example.com" />


        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value
            })
            }
            error={errors.password}
            placeholder="Create a strong password" />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600">

            {showPassword ?
            <EyeOff className="h-5 w-5" /> :

            <Eye className="h-5 w-5" />
            }
          </button>
          <PasswordStrengthMeter password={formData.password} />
        </div>

        <Input
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
          setFormData({
            ...formData,
            confirmPassword: e.target.value
          })
          }
          error={errors.confirmPassword}
          placeholder="Repeat your password" />


        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={formData.terms}
              onChange={(e) =>
              setFormData({
                ...formData,
                terms: e.target.checked
              })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />

          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms & Conditions
              </a>
            </label>
            {errors.terms &&
            <p className="text-red-600 text-xs mt-1">{errors.terms}</p>
            }
          </div>
        </div>

        {errors.form &&
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.form}
          </div>
        }

        <Button type="submit" fullWidth isLoading={isLoading}>
          Create Account
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="font-medium text-blue-600 hover:text-blue-500">

            Sign in
          </button>
        </p>
      </form>
    </AuthLayout>);

}