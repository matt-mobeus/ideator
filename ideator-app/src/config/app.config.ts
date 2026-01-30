export const APP_CONFIG = {
  name: 'IDEATOR',
  version: '0.1.0',
  description: 'Concept-mining and analysis platform',

  storage: {
    dbName: 'ideator',
    warningThresholdBytes: 1_073_741_824, // 1 GB
  },

  processing: {
    maxConcurrentJobs: 2,
    retryAttempts: 2,
    retryDelayMs: 3000,
  },

  ui: {
    conceptCardWidth: 180,
    conceptCardHeight: 220,
    toastDurationMs: {
      success: 3000,
      info: 4000,
      warning: 5000,
      error: 0, // persistent
    },
    transitionMs: 200,
    staggerDelayMs: 50,
    minDesktopWidth: 1024,
    minTabletWidth: 768,
  },
} as const
