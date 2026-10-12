'use client';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#64748B] font-medium">{label}</p>
          <p className="text-2xl font-semibold text-[#14213D] mt-2">{value}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
