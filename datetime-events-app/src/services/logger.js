import config from '../config';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const configuredLevel = LOG_LEVELS[config.logLevel] || LOG_LEVELS.info;

const logger = {
  error: (message, ...args) => {
    if (configuredLevel >= LOG_LEVELS.error) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },

  warn: (message, ...args) => {
    if (configuredLevel >= LOG_LEVELS.warn) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  info: (message, ...args) => {
    if (configuredLevel >= LOG_LEVELS.info) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  debug: (message, ...args) => {
    if (configuredLevel >= LOG_LEVELS.debug) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
};

export default logger;
