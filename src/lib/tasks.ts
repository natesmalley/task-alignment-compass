/**
 * Shared task and storage utilities for the Task‑Alignment Compass app.
 *
 * All components should import types and helpers from this module
 * instead of redeclaring `Task` locally.  This keeps the data model
 * in a single place and guarantees that localStorage access remains
 * consistent across VoiceAgent, DailyTaskEntry, dashboards, etc.
 */

import { v4 as uuidv4 } from 'uuid';

export type TaskCategory = 'personal' | 'professional';

export interface Task {
  id: string;                          // uuid‑v4
  text: string;                        // the raw task text
  category: TaskCategory;              // personal | professional
  priority: number;                    // 1‑based priority order
  completed: boolean;                  // track completion in UI
  createdAt: string;                   // ISO timestamp of capture
}

/** Entry representing a single day’s focus list + optional reflection. */
export interface DailyEntry {
  date: string;                        // new Date().toDateString()
  tasks: Task[];
  reflection?: string;
  /** precise moment the entry was saved (ISO) */
  timestamp: string;
}

/**
 * -------- Eisenhower-style priority helpers ------------------------
 *
 * We use a *very* lightweight heuristic:
 *   • Importance: professional = 2, personal = 1
 *   • Urgency:    newer tasks are more urgent
 * Score = importance + (1 / ageInHours)
 */
function _importanceWeight(category: TaskCategory): number {
  return category === 'professional' ? 2 : 1;
}

function _ageInHours(createdAt: string): number {
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.max(ms / (1000 * 60 * 60), 1); // clamp ≥ 1 hour
}

/** Return a descending‑sorted copy of tasks (highest score first). */
export function sortTasksByEisenhower(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const scoreA =
      _importanceWeight(a.category) + 1 / _ageInHours(a.createdAt);
    const scoreB =
      _importanceWeight(b.category) + 1 / _ageInHours(b.createdAt);
    return scoreB - scoreA;
  });
}

/* ------------------------------------------------------------------ *
 *  Local‑storage helpers (encapsulated so we can swap storage later) *
 * ------------------------------------------------------------------ */

const ENTRIES_KEY = 'dailyEntries';
const LAST_COMPLETED_KEY = 'lastCompleted';

/** Return every stored DailyEntry (empty array if none). */
export function getDailyEntries(): DailyEntry[] {
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
  } catch {
    console.warn('[task] Could not parse localStorage dailyEntries');
    return [];
  }
}

/** Persist the full array of entries back to localStorage. */
function setDailyEntries(entries: DailyEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

/** Append a new daily entry. */
export function saveDailyEntry(entry: DailyEntry): void {
  const entries = getDailyEntries();
  entries.push(entry);
  setDailyEntries(entries);
  setLastCompletedDate(entry.date);
}

/** Convenience: get date string when the checklist was last completed. */
export function getLastCompletedDate(): string | null {
  return localStorage.getItem(LAST_COMPLETED_KEY);
}

/** Store last completed date (e.g., to gate daily reminders). */
export function setLastCompletedDate(date: string): void {
  localStorage.setItem(LAST_COMPLETED_KEY, date);
}

/** Back‑compat alias used by DailyTaskEntry.tsx */
export const updateLastCompleted = setLastCompletedDate;

/** Add or update a single Task for today; auto‑creates today’s entry. */
export function upsertTodayTask(task: Task): void {
  const today = new Date().toDateString();
  const entries = getDailyEntries();
  let todayEntry = entries.find(e => e.date === today);

  if (!todayEntry) {
    todayEntry = { date: today, tasks: [], timestamp: new Date().toISOString() };
    entries.push(todayEntry);
  }

  const existingIdx = todayEntry.tasks.findIndex(t => t.id === task.id);
  if (existingIdx > -1) {
    todayEntry.tasks[existingIdx] = task;
  } else {
    todayEntry.tasks.push(task);
  }

  setDailyEntries(entries);
}

/** Retrieve tasks for today (empty array if none). */
export function getTodayTasks(): Task[] {
  const today = new Date().toDateString();
  const entry = getDailyEntries().find(e => e.date === today);
  return entry ? entry.tasks : [];
}

/** Back‑compat alias so legacy imports (`getTasksForToday`) continue to work. */
export const getTasksForToday = getTodayTasks;

/* ------------------------------------------------------------------ *
 *  Public helpers used by UI components                              *
 * ------------------------------------------------------------------ */

/** 
 * Create & persist a brand‑new task for today and return the saved object.
 * Accepts either:
 *   • addTask("Write report", "professional")
 *   • addTask({ text: "Write report", category: "professional" })
 */
export function addTask(
  textOrObj: string | { text: string; category: TaskCategory },
  categoryArg?: TaskCategory,
): Task {
  // Normalise parameters so we always end up with `text` + `category`
  const text =
    typeof textOrObj === 'string' ? textOrObj.trim() : textOrObj.text.trim();

  const category =
    typeof textOrObj === 'string'
      ? categoryArg
      : textOrObj.category;

  if (!text) {
    throw new Error('[tasks] addTask: task text is required');
  }
  if (category !== 'personal' && category !== 'professional') {
    throw new Error(
      `[tasks] addTask: category must be "personal" or "professional", received "${category}"`,
    );
  }

  const task: Task = {
    id: uuidv4(),
    text,
    category,
    priority: getTodayTasks().length + 1,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  upsertTodayTask(task);
  return task;
}

/**
 * Finalise today’s entry (e.g. after voice capture) and optionally attach
 * a daily reflection.  Returns the saved DailyEntry for convenience.
 */
export function finalizeEntry(reflection?: string): DailyEntry {
  // Re‑order today’s tasks by Eisenhower score and refresh priorities
  const sorted = sortTasksByEisenhower(getTodayTasks());
  sorted.forEach((t, idx) => (t.priority = idx + 1));

  const entry: DailyEntry = {
    date: new Date().toDateString(),
    tasks: sorted,
    reflection,
    timestamp: new Date().toISOString(),
  };

  saveDailyEntry(entry);
  return entry;
}

/** Quick aggregate counts for dashboards. */
export function getTaskCounts(date: string = new Date().toDateString()): {
  total: number;
  personal: number;
  professional: number;
} {
  const entry = getDailyEntries().find(e => e.date === date);
  return {
    total: entry?.tasks.length ?? 0,
    personal: entry?.tasks.filter(t => t.category === 'personal').length ?? 0,
    professional: entry?.tasks.filter(t => t.category === 'professional').length ?? 0,
  };
}