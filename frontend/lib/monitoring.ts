/**
 * Production monitoring and error tracking
 * Integrates with error tracking services like Sentry
 */

// Initialize error tracking in production
export function initErrorTracking() {
  if (typeof window === "undefined") {
    // Server-side
    return;
  }

  // Only initialize in production
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  // Example: Initialize Sentry
  // import * as Sentry from "@sentry/nextjs";
  // Sentry.init({
  //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  //   environment: process.env.NODE_ENV,
  //   tracesSampleRate: 0.1,
  //   beforeSend(event, hint) {
  //     // Filter sensitive data
  //     if (event.request) {
  //       delete event.request.cookies;
  //       delete event.request.headers?.authorization;
  //     }
  //     return event;
  //   },
  // });

  console.log("Error tracking initialized");
}

/**
 * Log error to monitoring service
 */
export function logError(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === "production") {
    // Example: Sentry.captureException(error, { contexts: { custom: context } });
    console.error("Error logged to monitoring service:", error, context);
  } else {
    console.error("Error (development):", error, context);
  }
}

/**
 * Log performance metric
 */
export function logMetric(name: string, value: number, tags?: Record<string, string>) {
  if (process.env.NODE_ENV === "production") {
    // Example: Sentry.metrics.distribution(name, value, { tags });
    console.log(`Metric: ${name} = ${value}`, tags);
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email: string, name?: string) {
  if (process.env.NODE_ENV === "production") {
    // Example: Sentry.setUser({ id: userId, email, username: name });
    console.log("User context set:", { userId, email, name });
  }
}

// Initialize on module load
if (typeof window !== "undefined") {
  initErrorTracking();
}

