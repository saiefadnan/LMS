import { create } from 'zustand';

export type ModalVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmModalOptions {
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
}

export interface AlertModalOptions {
  title: string;
  message: string;
  variant?: ModalVariant;
  buttonText?: string;
}

export interface PromptModalOptions {
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ModalState {
  isOpen: boolean;
  type: 'confirm' | 'alert' | 'prompt' | null;
  title: string;
  message: string;
  variant: ModalVariant;
  confirmText: string;
  cancelText: string;
  inputValue: string;
  placeholder: string;
  resolve?: (value: any) => void;

  openConfirm: (options: ConfirmModalOptions) => Promise<boolean>;
  openAlert: (options: AlertModalOptions) => Promise<void>;
  openPrompt: (options: PromptModalOptions) => Promise<string | null>;
  close: () => void;
  confirm: () => void;
  cancel: () => void;
  setInputValue: (val: string) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  type: null,
  title: '',
  message: '',
  variant: 'info',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  inputValue: '',
  placeholder: '',
  resolve: undefined,

  openConfirm: (options: ConfirmModalOptions) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        type: 'confirm',
        title: options.title,
        message: options.message,
        variant: options.variant || (options.title.toLowerCase().includes('delete') ? 'danger' : 'info'),
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        resolve,
      });
    });
  },

  openAlert: (options: AlertModalOptions) => {
    return new Promise<void>((resolve) => {
      set({
        isOpen: true,
        type: 'alert',
        title: options.title,
        message: options.message,
        variant: options.variant || 'info',
        confirmText: options.buttonText || 'Okay',
        cancelText: '',
        resolve: () => resolve(),
      });
    });
  },

  openPrompt: (options: PromptModalOptions) => {
    return new Promise<string | null>((resolve) => {
      set({
        isOpen: true,
        type: 'prompt',
        title: options.title,
        message: options.message || '',
        variant: 'info',
        confirmText: options.confirmText || 'Save',
        cancelText: options.cancelText || 'Cancel',
        inputValue: options.defaultValue || '',
        placeholder: options.placeholder || '',
        resolve,
      });
    });
  },

  close: () => {
    const { resolve, type } = get();
    if (resolve) {
      if (type === 'confirm') resolve(false);
      else if (type === 'prompt') resolve(null);
      else resolve(undefined);
    }
    set({ isOpen: false, type: null, resolve: undefined });
  },

  confirm: () => {
    const { resolve, type, inputValue } = get();
    if (resolve) {
      if (type === 'confirm') resolve(true);
      else if (type === 'prompt') resolve(inputValue);
      else resolve(undefined);
    }
    set({ isOpen: false, type: null, resolve: undefined });
  },

  cancel: () => {
    const { resolve, type } = get();
    if (resolve) {
      if (type === 'confirm') resolve(false);
      else if (type === 'prompt') resolve(null);
      else resolve(undefined);
    }
    set({ isOpen: false, type: null, resolve: undefined });
  },

  setInputValue: (inputValue: string) => set({ inputValue }),
}));

// Quick helper singleton functions for convenience
export const modal = {
  confirm: (options: ConfirmModalOptions) => useModalStore.getState().openConfirm(options),
  alert: (options: AlertModalOptions) => useModalStore.getState().openAlert(options),
  prompt: (options: PromptModalOptions) => useModalStore.getState().openPrompt(options),
};
