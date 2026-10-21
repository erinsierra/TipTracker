// Input validation
// Each validator returns an error message, or null if valid
import { toDateKey } from './dates';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_AMOUNT = 1000000;
const MAX_PARTY_SIZE = 100;

// Reads amounts like '560', '560.50' or '560,50', returns NaN if invalid
export function parseAmount(text) {
  const cleaned = String(text ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return NaN;
  return Number(cleaned);
}

export function validateName(name) {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return 'Enter your name.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 50) return 'Name must be 50 characters or fewer.';
  return null;
}

export function validateEmail(email) {
  const trimmed = (email ?? '').trim();
  if (!trimmed) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Enter a password.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include a letter and a number.';
  }
  return null;
}

export function validatePasswordMatch(password, confirmation) {
  if (!confirmation) return 'Confirm your password.';
  return password === confirmation ? null : 'Passwords do not match.';
}

// Validates a rand amount, label is used in the message (e.g. 'bill amount')
export function validateAmount(text, label, { allowZero = false } = {}) {
  if (!String(text ?? '').trim()) return `Enter the ${label}.`;
  const amount = parseAmount(text);
  if (Number.isNaN(amount)) return `Enter the ${label} as a number, e.g. 560.00.`;
  if (!allowZero && amount <= 0) return `The ${label} must be more than R0.`;
  if (amount > MAX_AMOUNT) return `The ${label} is too large.`;
  return null;
}

export function validatePercentage(text) {
  if (!String(text ?? '').trim()) return 'Enter a tip percentage.';
  const value = parseAmount(text);
  if (Number.isNaN(value)) return 'Enter the percentage as a number, e.g. 12.5.';
  if (value > 100) return 'The tip percentage cannot be more than 100.';
  return null;
}

export function validatePartySize(text) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return 'Enter the party size.';
  if (!/^\d+$/.test(trimmed)) return 'Party size must be a whole number.';
  const size = Number(trimmed);
  if (size < 1) return 'Party size must be at least 1.';
  if (size > MAX_PARTY_SIZE) return `Party size cannot be more than ${MAX_PARTY_SIZE}.`;
  return null;
}

// Validates the whole Log a Tip form
// Returns { field: error }, an empty object means it's valid
export function validateTipEntry({ shiftDate, billAmount, tipAmount, partySize }) {
  const errors = {};
  if (!shiftDate) errors.shiftDate = 'Choose the shift date.';
  else if (shiftDate > toDateKey()) errors.shiftDate = 'The shift date cannot be in the future.';

  const billError = validateAmount(billAmount, 'bill amount');
  if (billError) errors.billAmount = billError;

  const tipError = validateAmount(tipAmount, 'tip received', { allowZero: true });
  if (tipError) errors.tipAmount = tipError;
  else if (!billError && parseAmount(tipAmount) > parseAmount(billAmount)) {
    errors.tipAmount = 'The tip cannot be more than the bill.';
  }

  const partyError = validatePartySize(partySize);
  if (partyError) errors.partySize = partyError;

  return errors;
}
