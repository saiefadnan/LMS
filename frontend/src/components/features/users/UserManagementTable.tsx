'use client';

import React from 'react';
import { User, UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Search, Trash2 } from 'lucide-react';

interface UserManagementTableProps {
  users: User[];
  roles: UserRole[];
  currentUserId?: number;
  updatingUserId: number | null;
  onRoleChange: (userId: number, roleId: number) => void;
  onDeleteUser: (userId: number, username: string) => void;
}

export function UserManagementTable({
  users,
  roles,
  currentUserId,
  updatingUserId,
  onRoleChange,
  onDeleteUser,
}: UserManagementTableProps) {
  const getRoleBadgeStyle = (type?: string) => {
    switch (type) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-900';
      case 'content_manager':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'instructor':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'student':
      default:
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-xl border border-dashed border-surface-200 dark:border-surface-800 p-8 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 flex items-center justify-center mx-auto mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-surface-900 dark:text-surface-100 mb-1 text-sm">
          No users matched your criteria
        </h3>
        <p className="text-xs text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
          Try adjusting your search terms or role filter settings.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-surface-50 dark:bg-surface-800/60 border-b border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400 font-semibold text-xs uppercase tracking-wider">
              <th className="p-4 pl-6">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Current Role</th>
              <th className="p-4">Assign New Role</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {users.map((userItem) => {
              const currentRoleType =
                typeof userItem.role === 'object' ? userItem.role?.type : userItem.role;
              const currentRoleId =
                typeof userItem.role === 'object' ? userItem.role?.id : undefined;
              const isSelf = userItem.id === currentUserId;
              const isUpdating = updatingUserId === userItem.id;

              return (
                <tr
                  key={userItem.id}
                  className="hover:bg-surface-50/60 dark:hover:bg-surface-800/40 transition-colors"
                >
                  {/* User Avatar + Username */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center border border-brand-200 dark:border-brand-900 shrink-0">
                        {userItem.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-surface-900 dark:text-surface-100">
                            {userItem.username}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-1.5 py-0.2 rounded font-bold border border-brand-200 dark:border-brand-900">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-surface-400 dark:text-surface-500">
                          ID: #{userItem.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-4 text-surface-600 dark:text-surface-300 text-xs sm:text-sm">
                    {userItem.email || '—'}
                  </td>

                  {/* Role Badge */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getRoleBadgeStyle(
                        currentRoleType
                      )}`}
                    >
                      {userItem.role?.name || currentRoleType || 'Student'}
                    </span>
                  </td>

                  {/* Role Dropdown Selector */}
                  <td className="p-4">
                    {isSelf ? (
                      <span className="text-xs text-surface-400 dark:text-surface-500 italic">
                        Admin (Locked)
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          value={currentRoleId || ''}
                          onChange={(e) => onRoleChange(userItem.id, Number(e.target.value))}
                          disabled={isUpdating}
                          className="px-3 py-1.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs font-semibold text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer disabled:opacity-50"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id} className="dark:bg-surface-900">
                              {r.name} ({r.type})
                            </option>
                          ))}
                        </select>
                        {isUpdating && (
                          <div className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4 pr-6 text-right">
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteUser(userItem.id, userItem.username)}
                        className="p-2 text-surface-400 dark:text-surface-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
