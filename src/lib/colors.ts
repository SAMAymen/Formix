export type FormColors = {
  primary: string;
  border: string;
  background: string;
  text: string;
  lightText: string;
  error: string;
  success: string;
  inputBackground: string;
  inputText: string;
  buttonHover: string;
  inputBorderFocus: string;
  placeholderText: string;
  checkboxBackground: string;
  radioBorder: string;
  cardBackground: string;
};

export const defaultLightColors: FormColors = {
  "primary": "#16a34a",
  "border": "#e5e7eb",
  "background": "#ffffff",
  "text": "#202124",
  "lightText": "#5f6368",
  "error": "#dc2626",
  "success": "#16a34a",
  "inputBackground": "#fcfcfc",
  "inputText": "#202124",
  "buttonHover": "#15803d",
  "inputBorderFocus": "#86efac",
  "placeholderText": "#9ca3af",
  "checkboxBackground": "#ffffff",
  "radioBorder": "#d1d5db",
  "cardBackground": "#f8faf8"
};

export const defaultDarkColors: FormColors = {
  "primary": "#16a34a",
  "border": "#374151",
  "background": "#1f2937",
  "text": "#e5e7eb",
  "lightText": "#9ca3af",
  "error": "#ef4444",
  "success": "#22c55e",
  "inputBackground": "#111827",
  "inputText": "#e5e7eb",
  "buttonHover": "#15803d",
  "inputBorderFocus": "#86efac",
  "placeholderText": "#6b7280",
  "checkboxBackground": "#374151",
  "radioBorder": "#4b5563",
  "cardBackground": "#263142"
};

export function getThemeColors(theme: 'light' | 'dark'): FormColors {
  return theme === 'light' ? defaultLightColors : defaultDarkColors;
}