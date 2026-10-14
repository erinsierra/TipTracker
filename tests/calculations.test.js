import {
  averageTipPercentage,
  buildTrend,
  calculateTipAmount,
  calculateTipPercentage,
  compareToBenchmark,
  filterByDateRange,
  rangeForFilter,
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
  test('calculates the tip amount from the wireframe example', () => {
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
  });
});

describe('benchmark comparison', () => {
  test('labels the result above, near or below', () => {
    expect(compareToBenchmark(13.1, 11.8)).toBe('above');
    expect(compareToBenchmark(12.0, 11.8)).toBe('near');
    expect(compareToBenchmark(10.2, 11.8)).toBe('below');
  });

  test('returns null when there is nothing to compare', () => {
    expect(compareToBenchmark(null, 11.8)).toBeNull();
  });
});

describe('date ranges', () => {
  const entries = [entry('2026-08-01', 10, 10), entry('2026-08-15', 20, 10), entry('2026-08-18', 30, 10)];

  test('keeps entries inside the range, ends included', () => {
    expect(filterByDateRange(entries, '2026-08-15', '2026-08-18')).toHaveLength(2);
  });

  test('an open range keeps everything', () => {
    expect(filterByDateRange(entries, null, null)).toHaveLength(3);
  });

  test('builds the range for each history filter', () => {
    expect(rangeForFilter('7d', '2026-08-18')).toEqual({ start: '2026-08-12', end: '2026-08-18' });
    expect(rangeForFilter('30d', '2026-08-18')).toEqual({ start: '2026-07-20', end: '2026-08-18' });
    expect(rangeForFilter('month', '2026-08-18')).toEqual({ start: '2026-08-01', end: '2026-08-18' });
    expect(rangeForFilter('all', '2026-08-18')).toEqual({ start: null, end: null });
  });
});

describe('earnings trend', () => {
  const entries = [
    entry('2026-08-18', 70, 12), // Tuesday
    entry('2026-08-18', 30, 12),
    entry('2026-08-12', 50, 12), // six days earlier
    entry('2026-07-02', 40, 12),
  ];

  test('daily: seven bars ending today, with tips summed per day', () => {
    const trend = buildTrend(entries, 'daily', '2026-08-18');
    expect(trend).toHaveLength(7);
    expect(trend[0]).toMatchObject({ key: '2026-08-12', total: 50 });
    expect(trend[6]).toMatchObject({ key: '2026-08-18', label: 'Tue', total: 100 });
  });

  test('weekly: six bars, weeks starting on Monday', () => {
    const trend = buildTrend(entries, 'weekly', '2026-08-18');
    expect(trend).toHaveLength(6);
    expect(trend[5]).toMatchObject({ key: '2026-08-17', total: 100 });
    expect(trend[4]).toMatchObject({ key: '2026-08-10', total: 50 });
  });

  test('monthly: six bars ending this month', () => {
    const trend = buildTrend(entries, 'monthly', '2026-08-18');
    expect(trend.map((bar) => bar.label)).toEqual(['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']);
    expect(trend[4].total).toBe(40);
    expect(trend[5].total).toBe(150);
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
