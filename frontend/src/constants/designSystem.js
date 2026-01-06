/**
 * Design System Constants
 * Based on: [FE] Online Auction – Online Auction Website Styling Guide (Minimal, Modern, eBay-Inspired)
 *
 * Color Palette, Typography, Spacing, and Component Rules
 */

// ============================================
// 1. COLOR PALETTE
// ============================================
export const COLORS = {
  // Primary backgrounds
  WHISPER: "#F8F6F0", // Page background
  SOFT_CLOUD: "#F0EEE6", // Card backgrounds, section backgrounds

  // Accents & Borders
  MORNING_MIST: "#B3BFB9", // Borders, subtle accents
  PEBBLE: "#938A83", // Sub-labels, hints, placeholders

  // Text & Buttons
  MIDNIGHT_ASH: "#1F1F1F", // Primary text, primary buttons

  // Additional utilities
  WHITE: "#FFFFFF",
  BLACK: "#000000",
};

// ============================================
// 2. TYPOGRAPHY
// ============================================
export const TYPOGRAPHY = {
  // Font families
  FAMILY_BASE:
    "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

  // Sizes (in px)
  SIZE_NAV: "16px", // 16–18px semibold (navigation)
  SIZE_HEADER: "18px", // Header text
  SIZE_CATEGORY_TITLE: "20px", // 20–22px bold (section titles)
  SIZE_LARGE_TITLE: "22px",
  SIZE_PRODUCT_TITLE: "16px", // Product titles (medium)
  SIZE_BODY: "14px", // Body text (14–15px)
  SIZE_BODY_LARGE: "15px",
  SIZE_LABEL: "12px", // Labels, captions (12–13px)
  SIZE_LABEL_LARGE: "13px",

  // Font weights
  WEIGHT_NORMAL: 400,
  WEIGHT_MEDIUM: 500,
  WEIGHT_SEMIBOLD: 600,
  WEIGHT_BOLD: 700,

  // Line heights
  LINE_HEIGHT_TIGHT: 1.4,
  LINE_HEIGHT_NORMAL: 1.5,
  LINE_HEIGHT_RELAXED: 1.8,
};

// ============================================
// 3. SPACING SCALE
// ============================================
export const SPACING = {
  XS: "4px",
  S: "8px",
  M: "16px",
  L: "24px",
  XL: "32px",
  XXL: "48px",
};

// ============================================
// 4. SHADOWS
// ============================================
export const SHADOWS = {
  // Minimal, subtle shadows only
  SUBTLE: "0 2px 6px rgba(0, 0, 0, 0.05)",
  LIGHT: "0 1px 3px rgba(0, 0, 0, 0.06)",
  CARD: "0 1px 2px rgba(0, 0, 0, 0.04)",
};

// ============================================
// 5. BORDER RADIUS
// ============================================
export const BORDER_RADIUS = {
  SMALL: "6px",
  MEDIUM: "8px",
  LARGE: "12px",
  FULL: "9999px",
};

// ============================================
// 6. BUTTONS (PILL-SHAPED)
// ============================================
export const BUTTON_STYLES = {
  PRIMARY: {
    background: COLORS.MIDNIGHT_ASH,
    color: COLORS.WHITE,
    border: "none",
    borderRadius: BORDER_RADIUS.FULL,
    fontSize: TYPOGRAPHY.SIZE_BODY,
    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
    padding: `${SPACING.S} ${SPACING.L}`,
    cursor: "pointer",
    transition: "opacity 0.2s ease",
    "&:hover": {
      opacity: 0.9,
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },

  SECONDARY: {
    background: "transparent",
    color: COLORS.MIDNIGHT_ASH,
    border: `1.5px solid ${COLORS.MORNING_MIST}`,
    borderRadius: BORDER_RADIUS.FULL,
    fontSize: TYPOGRAPHY.SIZE_BODY,
    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
    padding: `${SPACING.S} ${SPACING.L}`,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: COLORS.WHISPER,
    },
  },

  TERTIARY: {
    background: "transparent",
    color: COLORS.MIDNIGHT_ASH,
    border: "none",
    borderRadius: BORDER_RADIUS.FULL,
    fontSize: TYPOGRAPHY.SIZE_BODY,
    fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
    padding: `${SPACING.S} ${SPACING.M}`,
    cursor: "pointer",
    transition: "opacity 0.2s ease",
    "&:hover": {
      opacity: 0.7,
    },
  },
};

// ============================================
// 7. CARD STYLES
// ============================================
export const CARD_STYLES = {
  background: COLORS.WHITE,
  border: `1px solid rgba(179, 191, 185, 0.2)`, // Morning Mist @ 20%
  borderRadius: BORDER_RADIUS.MEDIUM,
  padding: `${SPACING.M} ${SPACING.L}`,
  boxShadow: SHADOWS.SUBTLE,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: SHADOWS.LIGHT,
  },
};

// ============================================
// 8. INPUTS & FORM ELEMENTS
// ============================================
export const INPUT_STYLES = {
  background: COLORS.WHITE,
  color: COLORS.MIDNIGHT_ASH,
  border: `1.5px solid ${COLORS.MORNING_MIST}`,
  borderRadius: BORDER_RADIUS.MEDIUM,
  padding: `${SPACING.S} ${SPACING.M}`,
  fontSize: TYPOGRAPHY.SIZE_BODY,
  fontFamily: TYPOGRAPHY.FAMILY_BASE,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",

  "&::placeholder": {
    color: COLORS.PEBBLE,
  },

  "&:focus": {
    outline: "none",
    borderColor: COLORS.MIDNIGHT_ASH,
    boxShadow: `0 0 0 3px rgba(31, 31, 31, 0.1)`,
  },
};

// ============================================
// 9. SEARCH BAR
// ============================================
export const SEARCH_BAR_STYLES = {
  height: "42px",
  borderRadius: BORDER_RADIUS.FULL,
  border: `1.5px solid ${COLORS.MORNING_MIST}`,
  background: COLORS.WHITE,
  fontSize: TYPOGRAPHY.SIZE_BODY,
  padding: `${SPACING.S} ${SPACING.L}`,

  "&::placeholder": {
    color: COLORS.PEBBLE,
  },
};

// ============================================
// 10. LAYOUT CONSTRAINTS
// ============================================
export const LAYOUT = {
  MAX_CONTENT_WIDTH: "1400px",
  SIDEBAR_WIDTH: "256px", // lg:w-64
  CONTAINER_PADDING: "16px", // px-4
};

// ============================================
// 11. HOVER & INTERACTION STATES
// ============================================
export const INTERACTIONS = {
  CARD_HOVER_SCALE: 1.01,
  BUTTON_DARKEN_PERCENT: 10,
  TRANSITION_TIMING: "0.2s ease",
};

// ============================================
// 12. UTILITY TAILWIND MAPPINGS
// ============================================
/**
 * Map PDF colors to Tailwind utilities for direct usage in className
 *
 * Instead of: className="bg-gray-100"
 * Use: className="bg-[#F8F6F0]" or the predefined tailwind extensions
 */
export const TAILWIND_COLOR_MAP = {
  "bg-whisper": `bg-[${COLORS.WHISPER}]`,
  "bg-soft-cloud": `bg-[${COLORS.SOFT_CLOUD}]`,
  "bg-morning-mist": `bg-[${COLORS.MORNING_MIST}]`,
  "bg-pebble": `bg-[${COLORS.PEBBLE}]`,
  "bg-midnight-ash": `bg-[${COLORS.MIDNIGHT_ASH}]`,

  "text-midnight-ash": `text-[${COLORS.MIDNIGHT_ASH}]`,
  "text-pebble": `text-[${COLORS.PEBBLE}]`,
  "text-morning-mist": `text-[${COLORS.MORNING_MIST}]`,

  "border-morning-mist": `border-[${COLORS.MORNING_MIST}]`,
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
  BUTTON_STYLES,
  CARD_STYLES,
  INPUT_STYLES,
  SEARCH_BAR_STYLES,
  LAYOUT,
  INTERACTIONS,
  TAILWIND_COLOR_MAP,
};
