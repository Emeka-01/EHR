import React from 'react';
interface PasswordStrengthMeterProps {
  password?: string;
}
export function PasswordStrengthMeter({
  password = ''
}: PasswordStrengthMeterProps) {
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score; // Max 5
  };
  const strength = calculateStrength(password);
  const getLabel = () => {
    if (strength === 0) return '';
    if (strength < 3) return 'Weak';
    if (strength === 3) return 'Fair';
    if (strength === 4) return 'Good';
    return 'Strong';
  };
  const getColor = () => {
    if (strength < 3) return 'bg-red-500';
    if (strength === 3) return 'bg-orange-500';
    if (strength === 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1.5 mb-1">
        {[1, 2, 3, 4].map((level) =>
        <div
          key={level}
          className={`flex-1 rounded-full transition-colors duration-300 ${strength >= level ? getColor() : 'bg-gray-200'}`} />

        )}
      </div>
      {password &&
      <p
        className={`text-xs font-medium text-right ${strength < 3 ? 'text-red-600' : strength === 3 ? 'text-orange-600' : strength === 4 ? 'text-yellow-600' : 'text-green-600'}`}>

          {getLabel()}
        </p>
      }
    </div>);

}