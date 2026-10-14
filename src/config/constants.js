/** App-wide constants. */

export const COLLECTIONS = { users: 'users', tipEntries: 'tipEntries', calculatorSessions: 'calculatorSessions' };

export const ROLES = { server: 'server', admin: 'admin' };

/** South African tipping norm. The calculator offers these as one-tap choices. */
export const SA_NORM = { min: 10, max: 15, suggested: 12.5 };
export const TIP_PRESETS = [10, 12.5, 15];

/**
 * The two tip-display variants used for A/B testing on the customer calculator.
 * Each calculator session records which variant the customer saw.
 */
export const DISPLAY_VARIANTS = {
  A: {
    id: 'A',
    name: 'Percentage only',
    description: 'Suggested tips are shown as percentages.',
    suggestedPercentages: TIP_PRESETS,
  },
  B: {
    id: 'B',
    name: 'Percentage with rand amount',
    description: 'Suggested tips show the rand amount and the South African norm.',
    suggestedPercentages: TIP_PRESETS,
  },
};

/** How long to wait for the cloud before saving a tip to the offline queue. */
export const NETWORK_TIMEOUT_MS = 8000;
