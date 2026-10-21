// Pure tip maths and list helpers
// No Firebase or UI code here, so it's easy to test (see /tests)

// Rounds to the given decimals (2 by default for rand)
export function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

// Tip in rand from a bill and percentage
export function calculateTipAmount(billAmount, percentage) {
  return roundTo((billAmount * percentage) / 100);
}

// Tip as a percentage of the bill, returns 0 if there's no bill
export function calculateTipPercentage(billAmount, tipAmount) {
  if (!billAmount || billAmount <= 0) return 0;
  return roundTo((tipAmount / billAmount) * 100, 1);
}

// Average tip percentage, or null if there are no entries
export function averageTipPercentage(entries) {
  if (!entries.length) return null;
  const total = entries.reduce((sum, entry) => sum + entry.tipPercentage, 0);
  return roundTo(total / entries.length, 1);
}

// Total tips in rand
export function totalTips(entries) {
  return roundTo(entries.reduce((sum, entry) => sum + entry.tipAmount, 0));
}

// Sorts newest first by shift date, then by created time
export function sortNewestFirst(entries) {
  return [...entries].sort((a, b) => b.shiftDate.localeCompare(a.shiftDate) || (b.createdAt || 0) - (a.createdAt || 0));
}

// Summarises calculator sessions per display variant for the A/B report
// Returns e.g. { A: { sessions, averageBill, averageSelected, keptSuggestion } }
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
// Converts a Date to "YYYY-MM-DD" in local time
function toKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Keeps entries with a shiftDate between startKey and endKey
// A null start or end means no limit on that side
export function filterByDateRange(entries, startKey, endKey) {
  return entries.filter((entry) => {
    if (startKey && entry.shiftDate < startKey) return false;
    if (endKey && entry.shiftDate > endKey) return false;
    return true;
  });
}

// Returns start and end dates for a History filter
export function rangeForFilter(filter, today = new Date()) {
  const end = toKey(today);

  if (filter === '7d') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { start: toKey(start), end };
  }
  if (filter === '30d') {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return { start: toKey(start), end };
  }
  if (filter === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: toKey(start), end };
  }
  return { start: null, end: null };
}
