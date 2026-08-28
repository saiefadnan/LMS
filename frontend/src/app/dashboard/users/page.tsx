'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { getAllUsers, getRoles, updateUserRole, deleteUser } from '@/lib/api';
import { type User, type UserRole } from '@/types';
import { Pagination } from '@/components/ui/Pagination';
import { UserMetricCards } from '@/components/features/users/UserMetricCards';
import { UserTableFilters } from '@/components/features/users/UserTableFilters';
import { UserManagementTable } from '@/components/features/users/UserManagementTable';
import { Shield, Check, AlertCircle } from 'lucide-react';
import { modal } from '@/stores/modal';

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const roleType = (typeof currentUser?.role === 'object' ? currentUser?.role?.type : currentUser?.role) || '';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        getAllUsers(),
        getRoles().catch(() => ({ roles: [] })),
      ]);

      setUsers(usersData || []);
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
      modal.alert({
        title: 'Action Not Allowed',
        message: 'You cannot delete your own admin account while currently logged in.',
        variant: 'warning',
      });
      return;
    }

    const confirmed = await modal.confirm({
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user account "${username}"? All associated progress and data will be removed.`,
      variant: 'danger',
      confirmText: 'Delete User',
    });
    if (!confirmed) return;

    try {
      await deleteUser(userId);
      showNotification(`User "${username}" deleted.`, 'success');
      await fetchData();
    } catch (err: any) {
      console.error('Failed to delete user', err);
      showNotification(err.message || 'Failed to delete user', 'error');
    }
  };

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

  if (!currentUser || roleType !== 'admin') return null;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>System Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-50">
          User Management & Roles
        </h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
          Manage all registered platform accounts, assign security roles, and enforce permissions.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm flex items-center justify-between shadow-xs animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Metric Summary Cards */}
      <UserMetricCards
        totalCount={users.length}
        studentCount={studentCount}
        instructorCount={instructorCount}
        managerAndAdminCount={managerCount + adminCount}
      />

      {/* Search & Filter Bar */}
      <UserTableFilters
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        roleFilter={roleFilter}
        onRoleFilterChange={(r) => {
          setRoleFilter(r);
          setPage(1);
        }}
        totalCount={users.length}
        studentCount={studentCount}
        instructorCount={instructorCount}
        managerCount={managerCount}
        adminCount={adminCount}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {/* Users Table */}
      {loading ? (
        <div className="p-16 text-center bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 dark:border-brand-400 mx-auto"></div>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-3">Loading users directory...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <UserManagementTable
            users={paginatedUsers}
            roles={roles}
            currentUserId={currentUser?.id}
            updatingUserId={updatingUserId}
            onRoleChange={handleRoleChange}
            onDeleteUser={handleDeleteUser}
          />

          {paginatedUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-surface-200 dark:border-surface-800 rounded-xl bg-white dark:bg-surface-900 text-xs text-surface-500 dark:text-surface-400">
              <div>
                Showing <span className="font-bold text-surface-900 dark:text-surface-100">{startCount}</span> to{' '}
                <span className="font-bold text-surface-900 dark:text-surface-100">{endCount}</span> of{' '}
                <span className="font-bold text-surface-900 dark:text-surface-100">{totalUsersCount}</span> users
              </div>

              <Pagination
                currentPage={page}
                totalPages={pageCount}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
