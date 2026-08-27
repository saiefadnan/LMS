'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { getAllUsers, getRoles, updateUserRole, deleteUser } from '@/lib/api';
import { type User, type UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Shield, GraduationCap, BookOpen, Search, Trash2, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserManagementPage() {
  const currentUser = useAuthStore((s) => s.user);
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const roleType = (typeof currentUser?.role === 'object' ? currentUser?.role?.type : currentUser?.role) || '';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        getAllUsers(),
        getRoles().catch(() => ({ roles: [] })),
      ]);

      setUsers(usersData || []);
      // Filter roles to standard 4 LMS roles
      const standardRoles = (rolesData.roles || []).filter((r) =>
        ['admin', 'content_manager', 'instructor', 'student'].includes(r.type)
      );
      setRoles(standardRoles);
    } catch (err: any) {
      console.error('Failed to load user management data', err);
      showNotification(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && roleType !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, roleType, router]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    try {
      setUpdatingUserId(userId);
      await updateUserRole(userId, newRoleId);
      const roleObj = roles.find((r) => r.id === newRoleId);
      showNotification(`Role updated to ${roleObj?.name || 'new role'} successfully!`, 'success');
      await fetchData();
    } catch (err: any) {
      console.error('Failed to update role', err);
      showNotification(err.message || 'Failed to update user role', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${username}"?`)) {
      return;
    }

    try {
      await deleteUser(userId);
      showNotification(`User "${username}" deleted.`, 'success');
      await fetchData();
    } catch (err: any) {
      console.error('Failed to delete user', err);
      showNotification(err.message || 'Failed to delete user', 'error');
    }
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      u.username.toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term);

    const userRoleType = typeof u.role === 'object' ? u.role?.type : u.role;
    const matchesRole = roleFilter === 'all' || userRoleType === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalUsersCount = filteredUsers.length;
  const pageCount = Math.ceil(totalUsersCount / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const startCount = totalUsersCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endCount = Math.min(page * pageSize, totalUsersCount);

  const studentCount = users.filter((u) => (typeof u.role === 'object' ? u.role?.type : u.role) === 'student').length;
  const instructorCount = users.filter((u) => (typeof u.role === 'object' ? u.role?.type : u.role) === 'instructor').length;
  const managerCount = users.filter((u) => (typeof u.role === 'object' ? u.role?.type : u.role) === 'content_manager').length;
  const adminCount = users.filter((u) => (typeof u.role === 'object' ? u.role?.type : u.role) === 'admin').length;

  const getRoleBadgeStyle = (type?: string) => {
    switch (type) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'content_manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'instructor':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'student':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  if (!currentUser || roleType !== 'admin') return null;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>System Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900">
          User Management & Roles
        </h1>
        <p className="text-surface-500 text-sm mt-1">
          Manage all registered platform accounts, assign security roles, and enforce permissions.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-surface-100 text-surface-700 flex items-center justify-center text-xl font-bold">
            👥
          </div>
          <div>
            <span className="text-2xl font-black text-surface-900">{users.length}</span>
            <p className="text-xs text-surface-500 font-medium">Total Users</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            🎓
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-600">{studentCount}</span>
            <p className="text-xs text-surface-500 font-medium">Students</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            👨‍🏫
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600">{instructorCount}</span>
            <p className="text-xs text-surface-500 font-medium">Instructors</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
            🛡️
          </div>
          <div>
            <span className="text-2xl font-black text-purple-600">{managerCount + adminCount}</span>
            <p className="text-xs text-surface-500 font-medium">Managers & Admins</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-sm mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-surface-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => {
              setRoleFilter('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-brand-600 text-white'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            All Roles ({users.length})
          </button>
          <button
            onClick={() => {
              setRoleFilter('student');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              roleFilter === 'student'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Students ({studentCount})
          </button>
          <button
            onClick={() => {
              setRoleFilter('instructor');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              roleFilter === 'instructor'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Instructors ({instructorCount})
          </button>
          <button
            onClick={() => {
              setRoleFilter('content_manager');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              roleFilter === 'content_manager'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Managers ({managerCount})
          </button>
          <button
            onClick={() => {
              setRoleFilter('admin');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Admins ({adminCount})
          </button>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto text-xs text-surface-500 font-medium">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-surface-50 border border-surface-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-xl border border-surface-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
          <p className="text-surface-500 text-sm mt-3">Loading users directory...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-surface-300 p-6">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="font-bold text-surface-900 mb-1">No users matched your criteria</h3>
          <p className="text-sm text-surface-500">
            Try adjusting your search terms or filter settings.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Assign New Role</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {paginatedUsers.map((userItem) => {
                  const currentRoleType = typeof userItem.role === 'object' ? userItem.role?.type : userItem.role;
                  const currentRoleId = typeof userItem.role === 'object' ? userItem.role?.id : undefined;
                  const isSelf = userItem.id === currentUser?.id;
                  const isUpdating = updatingUserId === userItem.id;

                  return (
                    <tr key={userItem.id} className="hover:bg-surface-50/60 transition-colors">
                      {/* User Avatar + Username */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200 shrink-0">
                            {userItem.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-surface-900">{userItem.username}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-surface-400">ID: #{userItem.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 text-surface-600 text-xs sm:text-sm">
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
                          <span className="text-xs text-surface-400 italic">Admin (Locked)</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={currentRoleId || ''}
                              onChange={(e) => handleRoleChange(userItem.id, Number(e.target.value))}
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs font-semibold text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer disabled:opacity-50"
                            >
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>
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
                            onClick={() => handleDeleteUser(userItem.id, userItem.username)}
                            className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-surface-200 bg-surface-50 text-xs text-surface-500">
            <div>
              Showing <span className="font-bold text-surface-900">{startCount}</span> to{' '}
              <span className="font-bold text-surface-900">{endCount}</span> of{' '}
              <span className="font-bold text-surface-900">{totalUsersCount}</span> users
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="gap-1 px-2.5 py-1 text-xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>

              <span className="px-3 py-1 font-semibold text-surface-700 bg-white rounded border border-surface-200">
                Page {page} of {pageCount}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                className="gap-1 px-2.5 py-1 text-xs cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
