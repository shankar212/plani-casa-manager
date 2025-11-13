/**
 * Safe error logging utility
 * Logs detailed errors in development, generic messages in production
 */
export function logError(context: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  } else {
    // Production: only log context, not sensitive error details
    console.error(`Error in ${context}`);
  }
}
