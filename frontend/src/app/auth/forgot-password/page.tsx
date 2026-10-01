'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ForgotPasswordRequest } from '@/features/auth/types';

export default function ForgotPasswordPage() {
  const { forgotPasswordMutation } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>();

  const onSubmit = async (data: ForgotPasswordRequest) => {
    try {
      setSuccessMessage('');
      const result = await forgotPasswordMutation.mutateAsync(data);
      setSuccessMessage(result.message);
    } catch (error: any) {
      console.error('Forgot password error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Meetora</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/auth/sign-in" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {successMessage ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                {successMessage}
              </div>
              <p className="text-sm text-gray-600 text-center">
                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
              </p>
              <Link
                href="/auth/sign-in"
                className="block w-full text-center py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {forgotPasswordMutation.isError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {(forgotPasswordMutation.error as any)?.response?.data?.message || 'An error occurred. Please try again.'}
                </div>
              )}

              <p className="mb-6 text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
