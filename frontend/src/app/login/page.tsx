'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginUser } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { loginSchema, type LoginFormValues } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Target, BookOpen, Award, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Guest-only guard: redirect to /dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError('');
      await loginUser(data.identifier, data.password);
      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
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
      {/* Main Rounded Card Container matching Lumina template */}
      <div className="w-full max-w-5xl bg-white dark:bg-surface-900 rounded-3xl shadow-xl border border-surface-200/80 dark:border-surface-800 flex flex-col lg:flex-row overflow-hidden min-h-[600px] animate-auth-form">
        
        {/* Left Side: Form Section */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between relative animate-slide-left">
          {/* Top Header & Theme Switcher */}
          <div className="flex items-center justify-between mb-6">
            <Logo size="md" href="/" />
            <ThemeToggle size="sm" />
          </div>

          <div className="mx-auto w-full max-w-sm my-auto py-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-50 tracking-tight mb-2 animate-item-slide-left [animation-delay:80ms]">
                Welcome back!
              </h2>
              <p className="text-surface-500 dark:text-surface-400 text-xs sm:text-sm animate-item-slide-left [animation-delay:120ms]">
                Pick up where you left off, and keep things moving.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-2 animate-item-slide-left">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="animate-item-slide-left [animation-delay:150ms]">
                <Input
                  placeholder="Email or Username"
                  className="h-11 rounded-xl bg-surface-50 dark:bg-surface-800 border-transparent focus:bg-white dark:focus:bg-surface-900 text-sm px-4"
                  {...register('identifier')}
                  error={errors.identifier?.message}
                />
              </div>

              <div className="animate-item-slide-left [animation-delay:200ms]">
                <Input
                  type="password"
                  placeholder="Password"
                  className="h-11 rounded-xl bg-surface-50 dark:bg-surface-800 border-transparent focus:bg-white dark:focus:bg-surface-900 text-sm px-4"
                  {...register('password')}
                  error={errors.password?.message}
                />
              </div>

              {/* Remember me & Forgot password row */}
              <div className="flex items-center justify-between text-xs animate-item-slide-left [animation-delay:220ms] pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-surface-600 dark:text-surface-400 font-medium">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-surface-300 dark:border-surface-700"
                  />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <div className="animate-item-slide-left [animation-delay:250ms] pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs cursor-pointer active:scale-[0.99] transition-all"
                  isLoading={isSubmitting}
                >
                  Log In &rarr;
                </Button>
              </div>
            </form>

            <p className="mt-8 text-center text-xs text-surface-500 dark:text-surface-400 animate-item-slide-left [animation-delay:300ms]">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="text-center text-[11px] text-surface-400 dark:text-surface-600">
            &copy; {new Date().getFullYear()} LearnHub LMS. All rights reserved.
          </div>
        </div>

        {/* Right Side: Realistic Student Study Photograph Panel */}
        <div className="hidden lg:block lg:w-1/2 relative bg-surface-900 dark:bg-surface-800 animate-slide-right overflow-hidden group">
          <img
            src="/login_student_realistic.jpg"
            alt="Student Studying in Modern University Library"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
            <span className="px-3 py-1 bg-brand-500/90 text-white text-xs font-semibold rounded-full w-fit mb-2 backdrop-blur-xs">
              Focus & Excellence
            </span>
            <h3 className="text-xl font-bold">Pick up right where you left off</h3>
            <p className="text-xs text-surface-200 mt-1">Access curated engineering curriculum & real-time progress.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
