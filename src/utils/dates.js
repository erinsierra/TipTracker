// Date helpers
// Shift dates are stored as 'YYYY-MM-DD' in local time so they're easy to sort and compare
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Converts a Date to 'YYYY-MM-DD' in local time
export function toDateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Converts 'YYYY-MM-DD' back to a Date at local midnight
export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Moves a date key by a number of days (negative = earlier)
export function addDays(key, days) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

// e.g. '17 Aug'
export function formatShortDate(key) {
  const date = parseDateKey(key);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

// e.g. 'Mon, 17 Aug 2026'
export function formatLongDate(key) {
  const date = parseDateKey(key);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
