import { useTheme } from '../context/ThemeContext';

// Chart colours that adapt to light/dark mode. recharts can't read our CSS
// variables, so we resolve concrete values from the active theme here.
export function useChartTheme() {
  const { isDark } = useTheme();
  return {
    axis: isDark ? '#94a3b8' : '#5A6A7A',
    grid: isDark ? '#334155' : '#E5E7EB',
    tooltip: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
      borderRadius: 12,
      color: isDark ? '#e2e8f0' : '#1A1A2E',
    },
  };
}

// Brand-aligned series colours (consistent across all report charts).
export const SERIES = {
  revenue: '#22c55e', // green
  expenses: '#ef4444', // red
  primary: '#00A6FF',
  accent: '#FF6B6B',
};

// Expense-category bar colours (mirror the badge palette in constants.js).
export const CATEGORY_COLORS = {
  SUPPLIES: '#3b82f6',
  EQUIPMENT: '#8b5cf6',
  SALARY: '#22c55e',
  RENT: '#f97316',
  UTILITIES: '#eab308',
  OTHER: '#9ca3af',
};

export function categoryColor(category) {
  return CATEGORY_COLORS[category] || '#9ca3af';
}
