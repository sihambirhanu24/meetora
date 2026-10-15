'use client';

type TabType = 'upcoming' | 'pending' | 'previous' | 'personal';

interface MeetingTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    upcoming: number;
    pending: number;
    previous: number;
    personal: number;
  };
}

export function MeetingTabs({ activeTab, onTabChange, counts }: MeetingTabsProps) {
  const tabs = [
    { id: 'upcoming' as TabType, label: 'Upcoming', count: counts.upcoming },
    { id: 'pending' as TabType, label: 'Pending Invites', count: counts.pending },
    { id: 'previous' as TabType, label: 'Previous', count: counts.previous },
    { id: 'personal' as TabType, label: 'Personal Room', count: counts.personal },
  ];

  return (
    <div className="border-b border-[#E2E8F0]">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === tab.id
                ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                : 'text-[#64748B] hover:text-[#14213D]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-[#2563EB]'
                    : 'bg-slate-100 text-[#64748B]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
