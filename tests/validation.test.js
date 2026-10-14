import { addDays, toDateKey } from '../src/utils/dates';
import {
  parseAmount,
  validateAmount,
  validateEmail,
  validateName,
  validatePartySize,
  validatePassword,
  validatePasswordMatch,
  validatePercentage,
  validateTipEntry,
} from '../src/utils/validation';

describe('parseAmount', () => {
  test('reads whole numbers, decimals and comma decimals', () => {
    expect(parseAmount('560')).toBe(560);
    expect(parseAmount('560.50')).toBe(560.5);
    expect(parseAmount('560,50')).toBe(560.5);
  });

  test('rejects text, negatives and more than two decimals', () => {
    expect(parseAmount('abc')).toBeNaN();
    expect(parseAmount('-5')).toBeNaN();
    expect(parseAmount('1.234')).toBeNaN();
    expect(parseAmount('')).toBeNaN();
  });
});

describe('account fields', () => {
  test('name', () => {
    expect(validateName('')).toBeTruthy();
    expect(validateName('K')).toBeTruthy();
    expect(validateName('Keryn')).toBeNull();
  });

  test('email', () => {
    expect(validateEmail('')).toBeTruthy();
    expect(validateEmail('not-an-email')).toBeTruthy();
    expect(validateEmail('server@example.com')).toBeNull();
  });

  test('password needs 8 characters, a letter and a number', () => {
    expect(validatePassword('short1')).toBeTruthy();
    expect(validatePassword('longpassword')).toBeTruthy();
    expect(validatePassword('12345678')).toBeTruthy();
    expect(validatePassword('password1')).toBeNull();
  });

  test('password confirmation must match', () => {
    expect(validatePasswordMatch('password1', 'password2')).toBeTruthy();
    expect(validatePasswordMatch('password1', 'password1')).toBeNull();
  });
});

describe('amounts', () => {
  test('bill must be more than zero', () => {
    expect(validateAmount('', 'bill amount')).toBeTruthy();
    expect(validateAmount('0', 'bill amount')).toBeTruthy();
    expect(validateAmount('640', 'bill amount')).toBeNull();
  });

  test('a zero tip is allowed when asked for', () => {
    expect(validateAmount('0', 'tip received', { allowZero: true })).toBeNull();
  });

  test('percentage must be between 0 and 100', () => {
    expect(validatePercentage('101')).toBeTruthy();
    expect(validatePercentage('x')).toBeTruthy();
    expect(validatePercentage('12.5')).toBeNull();
  });

  test('party size must be a whole number from 1', () => {
    expect(validatePartySize('0')).toBeTruthy();
    expect(validatePartySize('2.5')).toBeTruthy();
    expect(validatePartySize('4')).toBeNull();
  });
});

describe('validateTipEntry', () => {
  const valid = { shiftDate: toDateKey(), billAmount: '640.00', tipAmount: '80.00', partySize: '4' };

  test('accepts a complete entry', () => {
    expect(validateTipEntry(valid)).toEqual({});
  });

  test('reports every empty field', () => {
    const errors = validateTipEntry({ shiftDate: toDateKey(), billAmount: '', tipAmount: '', partySize: '' });
    expect(Object.keys(errors).sort()).toEqual(['billAmount', 'partySize', 'tipAmount']);
  });

  test('rejects a tip larger than the bill', () => {
    expect(validateTipEntry({ ...valid, tipAmount: '700' }).tipAmount).toBeTruthy();
  });

  test('rejects a future shift date', () => {
    expect(validateTipEntry({ ...valid, shiftDate: addDays(toDateKey(), 1) }).shiftDate).toBeTruthy();
  });
});
