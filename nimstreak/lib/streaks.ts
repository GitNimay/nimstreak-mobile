import {
  format,
  subDays,
  startOfWeek,
  addDays,
  isSameDay,
  isAfter,
  isBefore,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInCalendarDays,
  parseISO,
} from 'date-fns';
import { supabase } from './supabase';

// ─── Types ───────────────────────────────────────────────────────
export type DayStatus = {
  date: Date;
  status: 'completed' | 'missed' | 'today' | 'future';
};

export type HeatmapDay = {
  date: Date;
  completed: boolean;
  dayOfMonth: number;
};

export type Streak = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  deadline_type: 'specific' | 'forever';
  deadline_date: string | null;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  created_at: string;
  is_active: boolean;
};

export type StreakLog = {
  id: string;
  streak_id: string;
  user_id: string;
  completed_date: string;
  created_at: string;
};

export type Subtask = {
  id: string;
  streak_id: string;
  title: string;
  order_index: number;
};

export type SubtaskCompletion = {
  id: string;
  subtask_id: string;
  streak_id: string;
  completed_date: string;
};

// ─── Calculation Functions ───────────────────────────────────────

export function calculateCurrentStreak(logs: Date[]): number {
  if (logs.length === 0) return 0;

  const sorted = [...logs].sort((a, b) => b.getTime() - a.getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = subDays(today, 1);

  // Check if the most recent log is today or yesterday
  const mostRecent = sorted[0];
  mostRecent.setHours(0, 0, 0, 0);

  if (!isSameDay(mostRecent, today) && !isSameDay(mostRecent, yesterday)) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i]);
    current.setHours(0, 0, 0, 0);
    const previous = new Date(sorted[i - 1]);
    previous.setHours(0, 0, 0, 0);

    const diff = differenceInCalendarDays(previous, current);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(logs: Date[]): number {
  if (logs.length === 0) return 0;

  const sorted = [...logs].sort((a, b) => a.getTime() - b.getTime());
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    prev.setHours(0, 0, 0, 0);
    const curr = new Date(sorted[i]);
    curr.setHours(0, 0, 0, 0);

    const diff = differenceInCalendarDays(curr, prev);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }

  return longest;
}

export function isCompletedToday(logs: Date[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return logs.some((log) => {
    const d = new Date(log);
    d.setHours(0, 0, 0, 0);
    return isSameDay(d, today);
  });
}

export function isStreakBroken(logs: Date[]): boolean {
  if (logs.length === 0) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = subDays(today, 1);

  const completedToday = isCompletedToday(logs);
  const completedYesterday = logs.some((log) => {
    const d = new Date(log);
    d.setHours(0, 0, 0, 0);
    return isSameDay(d, yesterday);
  });

  return !completedToday && !completedYesterday;
}

export function getWeekStatus(logs: Date[], weekStart?: Date): DayStatus[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = weekStart || startOfWeek(today, { weekStartsOn: 1 });
  const days: DayStatus[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    date.setHours(0, 0, 0, 0);

    const completed = logs.some((log) => {
      const d = new Date(log);
      d.setHours(0, 0, 0, 0);
      return isSameDay(d, date);
    });

    let status: DayStatus['status'];
    if (isSameDay(date, today)) {
      status = completed ? 'completed' : 'today';
    } else if (isAfter(date, today)) {
      status = 'future';
    } else {
      status = completed ? 'completed' : 'missed';
    }

    days.push({ date, status });
  }

  return days;
}

export function getMonthHeatmap(logs: Date[], month?: Date): HeatmapDay[] {
  const targetMonth = month || new Date();
  const start = startOfMonth(targetMonth);
  const end = endOfMonth(targetMonth);
  const allDays = eachDayOfInterval({ start, end });

  return allDays.map((date) => {
    const completed = logs.some((log) => {
      const d = new Date(log);
      d.setHours(0, 0, 0, 0);
      return isSameDay(d, date);
    });

    return {
      date,
      completed,
      dayOfMonth: date.getDate(),
    };
  });
}

// ─── CRUD Functions ──────────────────────────────────────────────

export async function fetchStreaks(userId: string): Promise<Streak[]> {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchStreak(streakId: string): Promise<Streak | null> {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('id', streakId)
    .single();

  if (error) throw error;
  return data;
}

export async function createStreak(
  userId: string,
  name: string,
  description: string | null,
  deadlineType: 'specific' | 'forever',
  deadlineDate: string | null,
  subtaskTitles: string[]
): Promise<Streak> {
  const { data: streak, error: streakError } = await supabase
    .from('streaks')
    .insert({
      user_id: userId,
      name,
      description,
      deadline_type: deadlineType,
      deadline_date: deadlineDate,
    })
    .select()
    .single();

  if (streakError) throw streakError;

  if (subtaskTitles.length > 0) {
    const subtasks = subtaskTitles.map((title, index) => ({
      streak_id: streak.id,
      title,
      order_index: index,
    }));

    const { error: subtaskError } = await supabase
      .from('subtasks')
      .insert(subtasks);
    if (subtaskError) throw subtaskError;
  }

  return streak;
}

export async function deleteStreak(streakId: string): Promise<void> {
  const { error } = await supabase
    .from('streaks')
    .update({ is_active: false })
    .eq('id', streakId);

  if (error) throw error;
}

export async function fetchStreakLogs(streakId: string): Promise<StreakLog[]> {
  const { data, error } = await supabase
    .from('streak_logs')
    .select('*')
    .eq('streak_id', streakId)
    .order('completed_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function markStreakComplete(
  streakId: string,
  userId: string
): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd');

  // Insert log
  const { error: logError } = await supabase.from('streak_logs').insert({
    streak_id: streakId,
    user_id: userId,
    completed_date: today,
  });

  if (logError) throw logError;

  // Fetch all logs and recalculate
  const logs = await fetchStreakLogs(streakId);
  const logDates = logs.map((l) => parseISO(l.completed_date));

  const currentStreak = calculateCurrentStreak(logDates);
  const longestStreak = calculateLongestStreak(logDates);

  const { error: updateError } = await supabase
    .from('streaks')
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_completions: logs.length,
    })
    .eq('id', streakId);

  if (updateError) throw updateError;
}

export async function fetchSubtasks(streakId: string): Promise<Subtask[]> {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('streak_id', streakId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchSubtaskCompletions(
  streakId: string,
  date: string
): Promise<SubtaskCompletion[]> {
  const { data, error } = await supabase
    .from('subtask_completions')
    .select('*')
    .eq('streak_id', streakId)
    .eq('completed_date', date);

  if (error) throw error;
  return data || [];
}

export async function toggleSubtaskCompletion(
  subtaskId: string,
  streakId: string,
  date: string,
  isCompleted: boolean
): Promise<void> {
  if (isCompleted) {
    // Remove completion
    const { error } = await supabase
      .from('subtask_completions')
      .delete()
      .eq('subtask_id', subtaskId)
      .eq('completed_date', date);
    if (error) throw error;
  } else {
    // Add completion
    const { error } = await supabase.from('subtask_completions').insert({
      subtask_id: subtaskId,
      streak_id: streakId,
      completed_date: date,
    });
    if (error) throw error;
  }
}

export async function updateStreak(
  streakId: string,
  name: string,
  description: string | null,
  deadlineType: 'specific' | 'forever',
  deadlineDate: string | null,
  subtaskTitles: string[]
): Promise<void> {
  const { error: streakError } = await supabase
    .from('streaks')
    .update({
      name,
      description,
      deadline_type: deadlineType,
      deadline_date: deadlineDate,
    })
    .eq('id', streakId);

  if (streakError) throw streakError;

  const { data: existingSubtasks, error: fetchErr } = await supabase
    .from('subtasks')
    .select('*')
    .eq('streak_id', streakId);
  if (fetchErr) throw fetchErr;

  const existing = existingSubtasks || [];
  
  for (let i = 0; i < subtaskTitles.length; i++) {
    if (i < existing.length) {
      await supabase.from('subtasks').update({ title: subtaskTitles[i], order_index: i }).eq('id', existing[i].id);
    } else {
      await supabase.from('subtasks').insert({ streak_id: streakId, title: subtaskTitles[i], order_index: i });
    }
  }

  if (subtaskTitles.length < existing.length) {
    const toDelete = existing.slice(subtaskTitles.length).map((s: any) => s.id);
    await supabase.from('subtask_completions').delete().in('subtask_id', toDelete);
    await supabase.from('subtasks').delete().in('id', toDelete);
  }
}
