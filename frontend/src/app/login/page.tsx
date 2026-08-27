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
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

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
      setError(err.message || 'Invalid credentials');
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Left Panel - Brand / Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 p-12 flex-col justify-between">
        <div className="text-white">
          <Link href="/" className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-brand-500">Learn</span>Hub
          </Link>
          <div className="mt-24 max-w-md">
            <h1 className="text-4xl font-bold mb-6 text-white leading-tight">
              Welcome back to your learning journey.
            </h1>
            <p className="text-surface-300 text-lg mb-8">
              Continue where you left off. Access your courses, track your progress, and master new skills.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: '🎯', text: 'Track your learning goals' },
                { icon: '📚', text: 'Access premium course content' },
                { icon: '🏆', text: 'Earn certificates of completion' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-surface-200">
                  <span className="text-xl">{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="lg:hidden text-2xl font-bold tracking-tight text-surface-900 flex items-center justify-center gap-1 mb-8">
              <span className="text-brand-600">Learn</span>Hub
            </Link>
            <h2 className="text-3xl font-bold text-surface-900">Sign In</h2>
            <p className="mt-2 text-surface-500">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠️</span>
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
