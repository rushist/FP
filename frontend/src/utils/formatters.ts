/**
 * Shared color mapping and currency formatting utilities
 */

export const DEPARTMENT_COLORS: Record<string, { bg: string; text: string; lightBg: string; border: string }> = {
  Engineering: {
    bg: '#2563eb',       // Blue
    text: '#1d4ed8',
    lightBg: '#eff6ff',
    border: '#bfdbfe',
  },
  Sales: {
    bg: '#059669',       // Emerald Green
    text: '#047857',
    lightBg: '#ecfdf5',
    border: '#a7f3d0',
  },
  HR: {
    bg: '#7c3aed',       // Violet
    text: '#6d28d9',
    lightBg: '#f5f3ff',
    border: '#ddd6fe',
  },
  Finance: {
    bg: '#d97706',       // Amber / Gold
    text: '#b45309',
    lightBg: '#fffbeb',
    border: '#fde68a',
  },
  Operations: {
    bg: '#dc2626',       // Crimson / Red
    text: '#b91c1c',
    lightBg: '#fef2f2',
    border: '#fecaca',
  },
};

const DEFAULT_COLOR = {
  bg: '#64748b',
  text: '#475569',
  lightBg: '#f8fafc',
  border: '#e2e8f0',
};

export function getDepartmentColor(deptName?: string) {
  if (!deptName) return DEFAULT_COLOR;
  return DEPARTMENT_COLORS[deptName] || DEFAULT_COLOR;
}

/**
 * Formats a number as Indian Rupee (INR) currency (₹)
 * Uses Indian numbering format: e.g. ₹1,85,000, ₹95,000
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '—';
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

  return `₹${formatted}`;
}
