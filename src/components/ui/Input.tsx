import React, { forwardRef } from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
    return (
      <div className="w-full">
        {label &&
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5">

            {label}
          </label>
        }
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-lg border px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white hover:border-gray-400'}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={
          error ?
          `${inputId}-error` :
          helperText ?
          `${inputId}-helper` :
          undefined
          }
          {...props} />

        {error &&
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600 flex items-center animate-in slide-in-from-top-1 duration-200">

            {error}
          </p>
        }
        {!error && helperText &&
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        }
      </div>);

  }
);
Input.displayName = 'Input';