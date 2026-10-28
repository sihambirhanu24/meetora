'use client';

import { useState } from 'react';
import type { WorkspaceMember } from '@/features/workspaces/types';
import { useUpdateMemberRole, useRemoveMember } from '@/features/workspaces/hooks/use-workspaces';

interface MemberListProps {
  workspaceId: string;
  members: WorkspaceMember[];
  myRole: string;
  currentUserId: string;
}

export function MemberList({ workspaceId, members, myRole, currentUserId }: MemberListProps) {
  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const canManageMembers = myRole === 'owner' || myRole === 'admin';

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole.mutateAsync({ 
        workspaceId,
        memberId, 
        role: newRole 
      });
      setEditingMemberId(null);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the workspace?')) {
      return;
    }

    try {
      await removeMember.mutateAsync({ workspaceId, memberId });
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      owner: { label: 'Owner', color: 'bg-purple-100 text-purple-800' },
      admin: { label: 'Admin', color: 'bg-blue-100 text-blue-800' },
      member: { label: 'Member', color: 'bg-green-100 text-green-800' },
      guest: { label: 'Guest', color: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[role as keyof typeof badges] || badges.member;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0]">
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h2 className="text-lg font-semibold text-[#14213D]">Members ({members.length})</h2>
        <p className="text-sm text-[#64748B] mt-0.5">
          Manage workspace members and their roles
        </p>
      </div>

      <div className="divide-y divide-[#E2E8F0]">
        {members.map((member) => {
          const isCurrentUser = member.user.id === currentUserId;
          const canModify = canManageMembers && !isCurrentUser && member.role !== 'owner';
          const isEditing = editingMemberId === member.id;

          return (
            <div key={member.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                {/* User Info */}
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {member.user.profileImage ? (
                      <img src={member.user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-[#2563EB]">
                        {member.user.firstName[0]}{member.user.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-[#14213D]">
                        {member.user.firstName} {member.user.lastName}
                        {isCurrentUser && <span className="ml-2 text-xs text-[#64748B]">(You)</span>}
                      </p>
                    </div>
                    <p className="text-xs text-[#64748B]">{member.user.email}</p>
                    {member.user.jobTitle && (
                      <p className="text-xs text-[#64748B] mt-0.5">{member.user.jobTitle}</p>
                    )}
                  </div>
                </div>

                {/* Role and Actions */}
                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="guest">Guest</option>
                    </select>
                  ) : (
                    getRoleBadge(member.role)
                  )}

                  {canModify && (
                    <div className="flex items-center space-x-2">
                      {!isEditing && (
                        <button
                          onClick={() => setEditingMemberId(member.id)}
                          className="p-1 text-slate-400 hover:text-[#2563EB] transition-colors"
                          title="Change role"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Remove member"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
