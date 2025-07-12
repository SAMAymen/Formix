// Simple logger implementation
export const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.log(`[WARNING] ${message}`),
  error: (message: string, error?: unknown) => console.error(`[ERROR] ${message}`, error || '')
};