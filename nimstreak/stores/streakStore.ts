import { create } from 'zustand';
import { Streak, StreakLog, Subtask, SubtaskCompletion } from '../lib/streaks';

interface StreakState {
  streaks: Streak[];
  currentStreak: Streak | null;
  streakLogs: StreakLog[];
  subtasks: Subtask[];
  subtaskCompletions: SubtaskCompletion[];
  isLoading: boolean;
  error: string | null;
  setStreaks: (streaks: Streak[]) => void;
  setCurrentStreak: (streak: Streak | null) => void;
  setStreakLogs: (logs: StreakLog[]) => void;
  setSubtasks: (subtasks: Subtask[]) => void;
  setSubtaskCompletions: (completions: SubtaskCompletion[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addStreak: (streak: Streak) => void;
  updateStreak: (id: string, updates: Partial<Streak>) => void;
  removeStreak: (id: string) => void;
  reset: () => void;
  lastUpdate: number;
  triggerUpdate: () => void;
}

export const useStreakStore = create<StreakState>((set) => ({
  streaks: [],
  currentStreak: null,
  streakLogs: [],
  subtasks: [],
  subtaskCompletions: [],
  isLoading: false,
  error: null,
  setStreaks: (streaks) => set({ streaks }),
  setCurrentStreak: (currentStreak) => set({ currentStreak }),
  setStreakLogs: (streakLogs) => set({ streakLogs }),
  setSubtasks: (subtasks) => set({ subtasks }),
  setSubtaskCompletions: (subtaskCompletions) => set({ subtaskCompletions }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addStreak: (streak) =>
    set((state) => ({ streaks: [streak, ...state.streaks] })),
  updateStreak: (id, updates) =>
    set((state) => ({
      streaks: state.streaks.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
      currentStreak:
        state.currentStreak?.id === id
          ? { ...state.currentStreak, ...updates }
          : state.currentStreak,
    })),
  removeStreak: (id) =>
    set((state) => ({
      streaks: state.streaks.filter((s) => s.id !== id),
    })),
  reset: () =>
    set({
      streaks: [],
      currentStreak: null,
      streakLogs: [],
      subtasks: [],
      subtaskCompletions: [],
      isLoading: false,
      error: null,
    }),
  lastUpdate: Date.now(),
  triggerUpdate: () => set((state) => ({ lastUpdate: Date.now() })),
}));
