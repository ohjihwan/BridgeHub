const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

function formatMessage(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [RTC-${level}]`;
  
  if (data) {
    return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
  }
  return `${prefix} ${message}`;
}

export function error(message, data = null) {
  if (currentLevel >= LOG_LEVELS.ERROR) {
    console.error(formatMessage('ERROR', message, data));
  }
}

export function warn(message, data = null) {
  if (currentLevel >= LOG_LEVELS.WARN) {
    console.warn(formatMessage('WARN', message, data));
  }
}

export function log(message, data = null) {
  if (currentLevel >= LOG_LEVELS.INFO) {
    console.log(formatMessage('INFO', message, data));
  }
}

export function debug(message, data = null) {
  if (currentLevel >= LOG_LEVELS.DEBUG) {
    console.log(formatMessage('DEBUG', message, data));
  }
}

export default {
  error,
  warn,
  log,
  debug,
};
