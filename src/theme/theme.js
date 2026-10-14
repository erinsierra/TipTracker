/**
 * Central design tokens for Tip Tracker.
 * Colours follow the terracotta-and-cream wireframes from Deliverable 3.
 * Every screen and component reads from here so the styling stays consistent.
 */
export const colors = {
  primary: '#D4552B', // terracotta - headers and main buttons
  primaryDark: '#B24321',
  primarySoft: '#E98A66',
  cream: '#FAEBD7', // summary cards
  creamBorder: '#F0D2A8',
  background: '#FFFFFF',
  text: '#2B2420',
  textMuted: '#6F6660',
  border: '#B9B2AD',
  white: '#FFFFFF',
  success: '#1E7B45',
  successSoft: '#CDEFD6',
  warning: '#8A5A00',
  warningSoft: '#FCE8B8',
  danger: '#B3261E',
  overlay: 'rgba(43, 36, 32, 0.55)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 24 };

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
};

export const fontSizes = { xs: 12, sm: 14, md: 16, lg: 20, xl: 26, xxl: 36 };

/** Minimum touch target height, so buttons are easy to hit on a busy floor. */
export const TOUCH_TARGET = 52;
