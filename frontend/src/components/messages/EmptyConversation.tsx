'use client';

export function EmptyConversation() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 bg-slate-50">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#14213D] mb-2">
          Select a conversation
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Choose a conversation from the list to view messages and start chatting with your team
        </p>
        <div className="flex flex-col gap-2 text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-600">
              ⌘
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-600">
              K
            </kbd>
            <span>to search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
