'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';

export function WelcomeSection() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-semibold text-[#14213D]">
            {getGreeting()}, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Everything you need to bring your team together.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Start an instant meeting
          </button>
          <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Create workspace
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-blue-600 transition-colors">
            Schedule a meeting
          </button>
        </div>
      </div>
    </div>
  );
}
