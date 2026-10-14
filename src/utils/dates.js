/**
 * Date helpers. Shift dates are stored as 'YYYY-MM-DD' strings in local time,
 * which keeps them easy to sort, filter and compare.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Converts a Date to a 'YYYY-MM-DD' key using the phone's local time. */
export function toDateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Converts a 'YYYY-MM-DD' key back to a Date at local midnight. */
export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Returns a new date key that is `days` away from the given key (negative = earlier). */
export function addDays(key, days) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** Returns the Monday of the week that contains the given date key. */
export function startOfWeek(key) {
  const weekday = parseDateKey(key).getDay(); // 0 = Sunday
  const daysSinceMonday = (weekday + 6) % 7;
  return addDays(key, -daysSinceMonday);
}

/** Returns the first day of the month that contains the given date key. */
export function startOfMonth(key) {
  return `${key.slice(0, 7)}-01`;
}

/** Returns the first day of the month `months` away from the given key. */
export function addMonths(key, months) {
  const date = parseDateKey(startOfMonth(key));
  date.setMonth(date.getMonth() + months);
  return toDateKey(date);
}

/** e.g. '17 Aug' */
export function formatShortDate(key) {
  const date = parseDateKey(key);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** e.g. 'Mon, 17 Aug 2026' */
export function formatLongDate(key) {
  const date = parseDateKey(key);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** e.g. 'Mon' */
export function weekdayLabel(key) {
  return WEEKDAYS[parseDateKey(key).getDay()];
}

/** e.g. 'Aug' */
export function monthLabel(key) {
  return MONTHS[parseDateKey(key).getMonth()];
}
