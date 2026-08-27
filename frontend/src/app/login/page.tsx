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
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Left Panel - Brand / Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 p-12 flex-col justify-between border-r border-surface-800">
        <div className="text-white">
          <Logo size="lg" theme="dark" href="/" />
          <div className="mt-24 max-w-md">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white leading-tight tracking-tight">
              Welcome back to your learning workspace.
            </h1>
            <p className="text-surface-300 text-base mb-8 leading-relaxed">
              Continue where you left off. Access your courses, track your progress, and master new skills.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: Target, text: 'Track lesson progress and assessments' },
                { icon: BookOpen, text: 'Access curated engineering curriculum' },
                { icon: Award, text: 'Validate skills with auto-graded quizzes' }
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex items-center gap-3 text-surface-200 text-sm font-medium">
                    <div className="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-brand-300" />
                    </div>
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Logo size="md" href="/" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">Sign In</h2>
            <p className="mt-1 text-surface-500 text-xs sm:text-sm">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Email or Username"
              placeholder="you@example.com"
              {...register('identifier')}
              error={errors.identifier?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
