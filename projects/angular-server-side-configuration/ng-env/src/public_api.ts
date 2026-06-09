export const NG_ENV: Record<string, string> =
  (globalThis as unknown as { NG_ENV?: Record<string, string> }).NG_ENV || {};
