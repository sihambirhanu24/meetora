'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function VerifyEmailPage() {
  const { verifyEmailMutation } = useAuth();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await verifyEmailMutation.mutateAsync({ token });
        setStatus('success');
        setMessage(result.message);
      } catch (error: any) {
        setStatus('error');
        setMessage(error?.response?.data?.message || 'Email verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [searchParams, verifyEmailMutation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Meetora</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Email Verification</h2>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg text-center">
          {status === 'verifying' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Email Verified!</h3>
              <p className="text-gray-600">{message}</p>
              <Link
                href="/auth/sign-in"
                className="inline-block mt-4 py-2 px-6 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
              >
                Go to Sign In
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Verification Failed</h3>
              <p className="text-red-600">{message}</p>
              <Link
                href="/auth/sign-in"
                className="inline-block mt-4 py-2 px-6 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
