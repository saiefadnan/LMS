'use client';

import React from 'react';
import { useModalStore, ModalVariant } from '@/stores/modal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertTriangle, Info, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export function GlobalModal() {
  const {
    isOpen,
    type,
    title,
    message,
    variant,
    confirmText,
    cancelText,
    inputValue,
    placeholder,
    close,
    confirm,
    cancel,
    setInputValue,
  } = useModalStore();

  if (!isOpen) return null;

  const getVariantIcon = (v: ModalVariant) => {
    switch (v) {
      case 'danger':
        return (
          <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'success':
        return (
          <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-900 shrink-0">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  const getConfirmButtonVariant = (v: ModalVariant) => {
    switch (v) {
      case 'danger':
        return 'danger' as const;
      case 'warning':
        return 'primary' as const;
      case 'success':
        return 'primary' as const;
      case 'info':
      default:
        return 'primary' as const;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      maxWidth="md"
      showCloseButton={type !== 'prompt'}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {getVariantIcon(variant)}
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 leading-tight">
            {title}
          </h3>
          {message && (
            <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
              {message}
            </p>
          )}

          {/* If prompt input */}
          {type === 'prompt' && (
            <div className="pt-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                autoFocus
                className="w-full text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirm();
                  if (e.key === 'Escape') cancel();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer action buttons */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
        {type !== 'alert' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancel}
            className="cursor-pointer text-xs"
          >
            {cancelText || 'Cancel'}
          </Button>
        )}
        <Button
          type="button"
          variant={getConfirmButtonVariant(variant)}
          size="sm"
          onClick={confirm}
          className="cursor-pointer text-xs font-semibold"
          autoFocus={type === 'alert'}
        >
          {confirmText || 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
}
