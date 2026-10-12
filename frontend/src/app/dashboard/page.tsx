'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-3xl font-bold text-[#14213D] mb-2">
            {getGreeting()}, {user.firstName}! 👋
          </h1>
          <p className="text-[#64748B] mb-4">
            The new dashboard components are ready but the server needs a restart.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-left">
            <p className="text-sm font-semibold text-[#2563EB] mb-2">To see the new dashboard:</p>
            <ol className="text-sm text-slate-700 space-y-1 ml-4 list-decimal">
              <li>Stop the frontend server (Ctrl+C in terminal)</li>
              <li>Run: <code className="bg-slate-100 px-2 py-1 rounded">npm run dev</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
