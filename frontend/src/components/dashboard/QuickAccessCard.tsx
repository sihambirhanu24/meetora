'use client';

import Link from 'next/link';

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  linkText: string;
}

export function QuickAccessCard({ title, description, icon, href, linkText }: QuickAccessCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {/* Icon Container */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#14213D]">{title}</h3>
          <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{description}</p>
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-blue-600 mt-3"
          >
            {linkText}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
