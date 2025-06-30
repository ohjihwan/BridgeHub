import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info'
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    }
    
    // 로그 디렉토리 생성
    this.logDir = path.join(__dirname, '../../logs')
    this.ensureLogDir()
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.logLevel]
  }

  formatMessage(level, ...args) {
    const timestamp = new Date().toISOString()
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
  }

  writeToFile(level, message) {
    if (process.env.NODE_ENV === 'production') {
      const logFile = path.join(this.logDir, `${level}.log`)
      fs.appendFileSync(logFile, message + '\n')
    }
  }

  error(...args) {
    if (this.shouldLog('error')) {
      const message = this.formatMessage('error', ...args)
      console.error(`❌ ${message}`)
      this.writeToFile('error', message)
    }
  }

  warn(...args) {
    if (this.shouldLog('warn')) {
      const message = this.formatMessage('warn', ...args)
      console.warn(`⚠️ ${message}`)
      this.writeToFile('warn', message)
    }
  }

  info(...args) {
    if (this.shouldLog('info')) {
      const message = this.formatMessage('info', ...args)
      console.info(`ℹ️ ${message}`)
      this.writeToFile('info', message)
    }
  }

  debug(...args) {
    if (this.shouldLog('debug')) {
      const message = this.formatMessage('debug', ...args)
      console.debug(`🔍 ${message}`)
      this.writeToFile('debug', message)
    }
  }

  // RTC 전용 로깅 메서드들
  rtc(event, data = {}) {
    this.info(`🎥 RTC Event: ${event}`, data)
  }

  media(event, data = {}) {
    this.info(`🎬 Media Event: ${event}`, data)
  }

  room(event, data = {}) {
    this.info(`🏠 Room Event: ${event}`, data)
  }

  peer(event, data = {}) {
    this.info(`👤 Peer Event: ${event}`, data)
  }

  transport(event, data = {}) {
    this.info(`🚚 Transport Event: ${event}`, data)
  }

  // 성능 측정
  time(label) {
    console.time(`⏱️ ${label}`)
  }

  timeEnd(label) {
    console.timeEnd(`⏱️ ${label}`)
  }

  // 에러 스택 트레이스와 함께 로깅
  errorWithStack(error, context = '') {
    const message = context ? `${context}: ${error.message}` : error.message
    this.error(message)
    if (error.stack) {
      this.debug('Stack trace:', error.stack)
    }
  }
}

export const logger = new Logger()
