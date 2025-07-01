// src/utils/storage.ts
// Centralised helpers for persisting the user’s Daily Entry data in
// localStorage.  All other modules (VoiceAgent, DailyTaskEntry, dashboard
// widgets, etc.) should call these helpers instead of touching
// localStorage directly so we keep the storage shape + keys consistent
// across the app.

import type { Task } from '@/types/task';

/** Single day’s entry – tasks plus optional reflection. */
export interface DailyEntry {
  /** Human‑readable date string produced by `new Date().toDateString()` */
  date: string;
  /** Ordered list of the user’s tasks for the day. */
  tasks: Task[];
  /** Free‑text reflection captured at the end of the day (optional). */
  reflection?: string;
  /** ISO timestamp – when the entry was saved. */
  timestamp: string;
}

const ENTRIES_KEY = 'dailyEntries';
const LAST_COMPLETED_KEY = 'lastCompleted';

/* =========================================================================
 * Public API
 * ========================================================================= */

/**
 * Persist a new daily entry.  Multiple entries for the same calendar day are
 * allowed (use‑case: the user adds additional tasks later in the day).
 */
export function saveDailyEntry(entry: DailyEntry): void {
  const existing = getDailyEntries();
  existing.push(entry);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(existing));

  // Remember the last day on which the checklist was completed
  localStorage.setItem(LAST_COMPLETED_KEY, entry.date);
}

/**
 * Overwrite the “last completed” date (used by the streak widget).
 *
 * @param date – Human‑readable date string produced by `new Date().toDateString()`
 */
export function updateLastCompleted(date: string): void {
  localStorage.setItem(LAST_COMPLETED_KEY, date);
}

/** Retrieve every entry we have stored (oldest → newest). */
export function getDailyEntries(): DailyEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? (JSON.parse(raw) as DailyEntry[]) : [];
  } catch {
    // Corrupted data – wipe the key and start fresh.
    localStorage.removeItem(ENTRIES_KEY);
    return [];
  }
}

/**
 * Wrapper used by components that want a resilient read.
 * Returns an empty array instead of throwing even if localStorage
 * is unavailable (e.g. in private‑mode) or the data is corrupted.
 */
export function safeLoadDailyEntries(): DailyEntry[] {
  try {
    return getDailyEntries();
  } catch {
    return [];
  }
}

/** Date string for the most recent day the user completed their list. */
export function getLastCompleted(): string | null {
  return localStorage.getItem(LAST_COMPLETED_KEY);
}

/** Completely wipe the user’s stored data (used for debugging / resets). */
export function clearStorage(): void {
  localStorage.removeItem(ENTRIES_KEY);
  localStorage.removeItem(LAST_COMPLETED_KEY);
}

/**
 * Aggregate simple task statistics for dashboards/widgets.
 *
 * Returns the total # of tasks we have captured across *all* entries, plus
 * a few handy breakdowns the UI currently visualises.
 *
 * NOTE: if you later extend the `Task` model (e.g. add `completed`,
 * `quadrant`, etc.) simply update the counters below – the rest of the app
 * can stay unchanged.
 */
export function getTaskCounts() {
  const entries = getDailyEntries();

  let total = 0;
  let completed = 0;
  let personal = 0;
  let professional = 0;

  for (const { tasks } of entries) {
    for (const task of tasks) {
      total += 1;

      // Count by (optional) completion flag – undefined defaults to pending.
      if ((task as any).completed) completed += 1;

      // Count by category.
      if (task.category === 'personal') personal += 1;
      else if (task.category === 'professional') professional += 1;
    }
  }

  return {
    total,
    completed,
    pending: total - completed,
    personal,
    professional,
  };
}
