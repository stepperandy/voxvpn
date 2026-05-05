import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV || 'development',
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      // Filter out noise
      if (event.exception) {
        const error = hint.originalException;
        if (error?.message?.includes('ResizeObserver')) {
          return null;
        }
      }
      return event;
    },
  });
}

export function captureException(error, context = {}) {
  Sentry.captureException(error, { contexts: { custom: context } });
}

export function captureMessage(message, level = 'info') {
  Sentry.captureMessage(message, level);
}