'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

function ResetPasswordContent() {
  const { resetPasswordMutation } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      return;
    }

    try {
      setSuccessMessage('');
      const result = await resetPasswordMutation.mutateAsync({
        token,
        newPassword: data.newPassword,
      });
      setSuccessMessage(result.message);
      
      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <p className="text-red-600 mb-4">Invalid or missing reset token</p>
            <Link
              href="/auth/forgot-password"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Request a new password reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Meetora</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Set new password</h2>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {successMessage ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                {successMessage}
              </div>
              <p className="text-sm text-gray-600 text-center">
                Redirecting to sign in...
              </p>
            </div>
          ) : (
            <>
              {resetPasswordMutation.isError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {(resetPasswordMutation.error as any)?.response?.data?.message || 'Failed to reset password. The link may have expired.'}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    {...register('newPassword', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        message: 'Password must contain uppercase, lowercase, number, and special character'
                      }
                    })}
                    type="password"
                    id="newPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: (value) => value === newPassword || 'Passwords do not match'
                    })}
                    type="password"
                    id="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
