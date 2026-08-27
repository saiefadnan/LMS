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
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { GraduationCap, UserCheck, AlertCircle } from 'lucide-react';

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

  const selectedRole = watch('role');

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
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Logo size="md" href="/" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">Create Account</h2>
            <p className="mt-1 text-surface-500 text-xs sm:text-sm">
              Join thousands of learners and instructors today
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Selection UI */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600 mb-2">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'student')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                    selectedRole === 'student'
                      ? 'border-brand-600 bg-brand-50/80 shadow-xs ring-1 ring-brand-600'
                      : 'border-surface-200 bg-white hover:border-surface-300'
                  }`}
                >
                  <GraduationCap className={`w-5 h-5 mb-1.5 ${selectedRole === 'student' ? 'text-brand-600' : 'text-surface-400'}`} />
                  <span className={`block font-semibold text-sm ${selectedRole === 'student' ? 'text-brand-900' : 'text-surface-900'}`}>Learn</span>
                  <span className="text-xs text-surface-500 mt-0.5 block">Take courses & quizzes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', 'instructor')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                    selectedRole === 'instructor'
                      ? 'border-brand-600 bg-brand-50/80 shadow-xs ring-1 ring-brand-600'
                      : 'border-surface-200 bg-white hover:border-surface-300'
                  }`}
                >
                  <UserCheck className={`w-5 h-5 mb-1.5 ${selectedRole === 'instructor' ? 'text-brand-600' : 'text-surface-400'}`} />
                  <span className={`block font-semibold text-sm ${selectedRole === 'instructor' ? 'text-brand-900' : 'text-surface-900'}`}>Teach</span>
                  <span className="text-xs text-surface-500 mt-0.5 block">Publish courses & lessons</span>
                </button>
              </div>
            </div>

            <Input
              label="Username"
              placeholder="johndoe"
              {...register('username')}
              error={errors.username?.message}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
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
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Brand / Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 p-12 flex-col justify-between">
        <div className="text-white">
          <Logo size="lg" theme="dark" href="/" />
        </div>
        
        <div className="mb-24">
          <blockquote className="text-2xl font-medium text-white leading-relaxed mb-6">
            "The beautiful thing about learning is that no one can take it away from you."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-xl">
              BB
            </div>
            <div>
              <p className="text-white font-medium">B.B. King</p>
              <p className="text-brand-300 text-sm">Legendary Musician</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
