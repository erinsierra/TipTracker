import {
  averageTipPercentage,
  calculateTipAmount,
  calculateTipPercentage,
  sortNewestFirst,
  summariseSessions,
  totalTips,
} from '../src/utils/calculations';

const entry = (shiftDate, tipAmount, tipPercentage, createdAt = 0) => ({
  shiftDate,
  tipAmount,
  tipPercentage,
  createdAt,
});

describe('tip maths', () => {
  test('calculates the tip amount', () => {
    expect(calculateTipAmount(560, 12.5)).toBe(70);
  });

  test('rounds the tip amount to cents', () => {
    expect(calculateTipAmount(333.33, 12.5)).toBe(41.67);
  });

  test('calculates the tip percentage to one decimal', () => {
    expect(calculateTipPercentage(640, 80)).toBe(12.5);
    expect(calculateTipPercentage(300, 35)).toBe(11.7);
  });

  test('returns 0% when there is no bill', () => {
    expect(calculateTipPercentage(0, 50)).toBe(0);
  });
});

describe('averages and totals', () => {
  const entries = [entry('2026-08-17', 60, 10), entry('2026-08-18', 70, 15)];

  test('averages tip percentages', () => {
    expect(averageTipPercentage(entries)).toBe(12.5);
  });

  test('returns null when there are no entries', () => {
    expect(averageTipPercentage([])).toBeNull();
  });

  test('adds up tips', () => {
    expect(totalTips(entries)).toBe(130);
    expect(totalTips([])).toBe(0);
  });
});

describe('sorting', () => {
  test('newest shift first, then newest created first', () => {
    const sorted = sortNewestFirst([
      entry('2026-08-17', 1, 1, 5),
      entry('2026-08-18', 2, 1, 1),
      entry('2026-08-18', 3, 1, 9),
    ]);
    expect(sorted.map((item) => item.tipAmount)).toEqual([3, 2, 1]);
  });
});

describe('A/B summary', () => {
  const session = (displayVariantId, billAmount, selectedPercentage) => ({
    displayVariantId,
    billAmount,
    suggestedPercentage: 12.5,
    selectedPercentage,
  });

  test('summarises sessions per variant', () => {
    const summary = summariseSessions(
      [session('A', 400, 12.5), session('A', 600, 10), session('B', 500, 15)],
      ['A', 'B']
    );
    expect(summary.A).toEqual({ sessions: 2, averageBill: 500, averageSelected: 11.3, keptSuggestion: 50 });
    expect(summary.B).toEqual({ sessions: 1, averageBill: 500, averageSelected: 15, keptSuggestion: 0 });
  });

  test('a variant with no sessions has empty figures', () => {
    expect(summariseSessions([], ['A']).A).toEqual({
      sessions: 0,
      averageBill: null,
      averageSelected: null,
      keptSuggestion: null,
    });
  });
});
