/**
 * Pure business logic for Tip Tracker: tip maths, averages, benchmark
 * comparison and chart data. No Firebase or UI code lives here, which keeps
 * these functions easy to test (see /tests).
 */
import { BENCHMARK_TOLERANCE } from '../config/constants';
import {
  addDays,
  addMonths,
  formatShortDate,
  monthLabel,
  startOfMonth,
  startOfWeek,
  toDateKey,
  weekdayLabel,
} from './dates';

/** Rounds to the given number of decimals (2 by default, for rand values). */
export function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Tip in rand for a bill and a tip percentage. */
export function calculateTipAmount(billAmount, percentage) {
  return roundTo((billAmount * percentage) / 100);
}

/** Tip as a percentage of the bill. Returns 0 when there is no bill to divide by. */
export function calculateTipPercentage(billAmount, tipAmount) {
  if (!billAmount || billAmount <= 0) return 0;
  return roundTo((tipAmount / billAmount) * 100, 1);
}

/** Mean tip percentage across entries, or null when there are none. */
export function averageTipPercentage(entries) {
  if (!entries.length) return null;
  const total = entries.reduce((sum, entry) => sum + entry.tipPercentage, 0);
  return roundTo(total / entries.length, 1);
}

/** Total rand value of the tips in the given entries. */
export function totalTips(entries) {
  return roundTo(entries.reduce((sum, entry) => sum + entry.tipAmount, 0));
}

/** Keeps entries whose shift date falls inside the range (both ends included). */
export function filterByDateRange(entries, startKey, endKey) {
  return entries.filter(
    (entry) => (!startKey || entry.shiftDate >= startKey) && (!endKey || entry.shiftDate <= endKey)
  );
}

/**
 * Compares a server's average with the benchmark.
 * @returns {'above' | 'near' | 'below' | null} null when either value is missing.
 */
export function compareToBenchmark(average, benchmark) {
  if (average == null || benchmark == null) return null;
  const difference = average - benchmark;
  if (Math.abs(difference) <= BENCHMARK_TOLERANCE) return 'near';
  return difference > 0 ? 'above' : 'below';
}

/**
 * Builds the bars for the earnings trend chart.
 * @param {Array} entries tip entries
 * @param {'daily' | 'weekly' | 'monthly'} mode
 * @param {string} todayKey 'YYYY-MM-DD' (passed in so the function is testable)
 * @returns {Array<{ key: string, label: string, total: number }>} oldest bar first
 */
export function buildTrend(entries, mode, todayKey = toDateKey()) {
  let buckets;

  if (mode === 'weekly') {
    const thisWeek = startOfWeek(todayKey);
    buckets = Array.from({ length: 6 }, (_, i) => {
      const start = addDays(thisWeek, (i - 5) * 7);
      return { key: start, label: formatShortDate(start), start, end: addDays(start, 6) };
    });
  } else if (mode === 'monthly') {
    buckets = Array.from({ length: 6 }, (_, i) => {
      const start = addMonths(todayKey, i - 5);
      return { key: start, label: monthLabel(start), start, end: addDays(addMonths(start, 1), -1) };
    });
  } else {
    buckets = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(todayKey, i - 6);
      return { key: day, label: weekdayLabel(day), start: day, end: day };
    });
  }

  return buckets.map(({ key, label, start, end }) => ({
    key,
    label,
    total: totalTips(filterByDateRange(entries, start, end)),
  }));
}

/**
 * Turns a history filter choice into a date range.
 * @param {'7d' | '30d' | 'month' | 'all'} filter
 */
export function rangeForFilter(filter, todayKey = toDateKey()) {
  switch (filter) {
    case '7d':
      return { start: addDays(todayKey, -6), end: todayKey };
    case '30d':
      return { start: addDays(todayKey, -29), end: todayKey };
    case 'month':
      return { start: startOfMonth(todayKey), end: todayKey };
    default:
      return { start: null, end: null };
  }
}

/** Sorts entries newest first: by shift date, then by the time they were created. */
export function sortNewestFirst(entries) {
  return [...entries].sort((a, b) => b.shiftDate.localeCompare(a.shiftDate) || (b.createdAt || 0) - (a.createdAt || 0));
}

/**
 * Summarises anonymous calculator sessions per display variant for the A/B report.
 * @returns {Object} e.g. { A: { sessions, averageBill, averageSelected, keptSuggestion } }
 */
export function summariseSessions(sessions, variantIds) {
  const summary = {};
  variantIds.forEach((id) => {
    const group = sessions.filter((session) => session.displayVariantId === id);
    const count = group.length;
    const sum = (field) => group.reduce((total, session) => total + session[field], 0);
    const kept = group.filter((s) => s.selectedPercentage === s.suggestedPercentage).length;
    summary[id] = {
      sessions: count,
      averageBill: count ? roundTo(sum('billAmount') / count) : null,
      averageSelected: count ? roundTo(sum('selectedPercentage') / count, 1) : null,
      keptSuggestion: count ? Math.round((kept / count) * 100) : null,
    };
  });
  return summary;
}
