'use client';

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface AuthInputFieldProps {
  placeholder: string;
  type?: string;
  register: UseFormRegisterReturn;
  error?: string;
  animationDelay?: string;
  autoComplete?: string;
}

export function AuthInputField({
  placeholder,
  type = 'text',
  register,
  error,
  animationDelay = '150ms',
  autoComplete,
}: AuthInputFieldProps) {
  return (
    <div
      className="animate-item-slide-left"
      style={{ animationDelay }}
    >
      <Input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 rounded-xl bg-surface-50 dark:bg-surface-800 border-transparent focus:bg-white dark:focus:bg-surface-900 text-sm px-4 shadow-2xs"
        {...register}
        error={error}
      />
    </div>
  );
}
