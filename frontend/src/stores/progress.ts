import { create } from 'zustand';
import { Progress } from '@/types';
import { getMyProgress } from '@/lib/api';

interface ProgressState {
  progress: Progress[];
  loading: boolean;
  fetchProgress: (courseId: string) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progress: [],
  loading: false,
  fetchProgress: async (courseId: string) => {
    set({ loading: true });
    try {
      const res = await getMyProgress(courseId);
      set({ progress: res.data || [], loading: false });
    } catch (err) {
      console.error('Failed to fetch progress', err);
      set({ loading: false });
    }
  },
}));
