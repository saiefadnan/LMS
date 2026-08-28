'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUser } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { registerSchema, type RegisterFormValues } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthInputField } from '@/components/features/auth/AuthInputField';
import { AuthRoleSelector } from '@/components/features/auth/AuthRoleSelector';
import { AuthPromoSide } from '@/components/features/auth/AuthPromoSide';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: 'student',
    },
  });

  const selectedRole = watch('role') as 'student' | 'instructor';

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError('');
      await registerUser(data.username, data.email, data.password, data.role);
      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Username or email might be taken.');
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-950 p-4 sm:p-6 lg:p-8 transition-colors duration-150 overflow-x-hidden">
      <div className="w-full max-w-5xl bg-white dark:bg-surface-900 rounded-3xl shadow-xl border border-surface-200/80 dark:border-surface-800 flex flex-col lg:flex-row overflow-hidden min-h-[620px] animate-auth-form">
        {/* Left Side: Form Section */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between relative animate-slide-left">
          {/* Top Header & Theme Switcher */}
          <div className="flex items-center justify-between mb-4">
            <Logo size="md" href="/" />
            <ThemeToggle size="sm" />
          </div>

          <div className="mx-auto w-full max-w-sm my-auto py-2">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-50 tracking-tight mb-1.5 animate-item-slide-left [animation-delay:80ms]">
                Create Account
              </h2>
              <p className="text-surface-500 dark:text-surface-400 text-xs sm:text-sm animate-item-slide-left [animation-delay:120ms]">
                Join thousands of learners and instructors today
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {error && (
                <div className="p-3 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-2 animate-item-slide-left">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Role Selection */}
              <AuthRoleSelector
                selectedRole={selectedRole}
                onSelectRole={(role) => setValue('role', role)}
                animationDelay="150ms"
              />

              <AuthInputField
                placeholder="Username"
                autoComplete="username"
                register={register('username')}
                error={errors.username?.message}
                animationDelay="200ms"
              />

              <AuthInputField
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                register={register('email')}
                error={errors.email?.message}
                animationDelay="250ms"
              />

              <AuthInputField
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                register={register('password')}
                error={errors.password?.message}
                animationDelay="300ms"
              />

              <div className="animate-item-slide-left [animation-delay:350ms] pt-1">
                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs cursor-pointer active:scale-[0.99] transition-all"
                  isLoading={isSubmitting}
                >
                  Create Account &rarr;
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-surface-500 dark:text-surface-400 animate-item-slide-left [animation-delay:400ms]">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="text-center text-[11px] text-surface-400 dark:text-surface-600">
            &copy; {new Date().getFullYear()} LearnHub LMS. All rights reserved.
          </div>
        </div>

        {/* Right Side: Photo Panel */}
        <AuthPromoSide
          imageSrc="/register_graduation_realistic.jpg"
          imageAlt="Proud Graduate on University Campus"
          badgeText="Verified Achievement"
          badgeBgColor="bg-amber-500/90"
          title="Earn industry-recognized certificates"
          description="Join thousands of successful graduates worldwide today."
        />
      </div>
    </div>
  );
}
