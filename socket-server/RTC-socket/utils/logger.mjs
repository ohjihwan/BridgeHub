const isProduction = process.env.NODE_ENV === "production";

/**
 * 시간 포맷: YYYY-MM-DD HH:mm:ss
 */
function timestamp() {
  return new Date().toISOString().replace('T', ' ').replace(/\..+/, '');
}

export const logger = {
  info: (...args) => {
    if (!isProduction) {
      console.log(`[INFO] [${timestamp()}]`, ...args);
    }
  },
  warn: (...args) => {
    console.warn(`[WARN] [${timestamp()}]`, ...args);
  },
  error: (...args) => {
    console.error(`[ERROR] [${timestamp()}]`, ...args);
  },
  debug: (...args) => {
    if (!isProduction) {
      console.debug(`[DEBUG] [${timestamp()}]`, ...args);
    }
  },
};