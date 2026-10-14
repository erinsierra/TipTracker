/**
 * App-wide constants that describe the pilot set-up.
 */

/** Firestore collection names. They mirror the tables in the Deliverable 3 ERD. */
export const COLLECTIONS = {
  restaurants: 'restaurants',
  users: 'users',
  tipEntries: 'tipEntries',
  benchmarks: 'benchmarks',
  calculatorSessions: 'calculatorSessions',
};

/** The pilot restaurant. New servers are linked to it when they register. */
export const DEFAULT_RESTAURANT = {
  id: 'bossa-woodbridge',
  name: 'Bossa Woodbridge',
  address: 'Woodbridge Island, Cape Town',
};

export const ROLES = { server: 'server', admin: 'admin' };

export const SHIFTS = ['Morning', 'Evening'];

/** South African tipping norm used when no local benchmark has been calculated yet. */
export const SA_NORM = { min: 10, max: 15, suggested: 12.5 };

/**
 * The two tip-display variants used for A/B testing on the customer calculator.
 * Each calculator session records which variant the customer saw.
 */
export const DISPLAY_VARIANTS = {
  A: {
    id: 'A',
    name: 'Percentage only',
    description: 'Suggested tips are shown as percentages.',
    suggestedPercentages: [10, 12.5, 15],
  },
  B: {
    id: 'B',
    name: 'Percentage with rand amount',
    description: 'Suggested tips show the rand amount and the local benchmark.',
    suggestedPercentages: [10, 12.5, 15],
  },
};

/** How close (in percentage points) an average must be to count as "on benchmark". */
export const BENCHMARK_TOLERANCE = 0.5;

/** How long to wait for the cloud before saving a tip to the offline queue. */
export const NETWORK_TIMEOUT_MS = 8000;
