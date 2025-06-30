import { logger } from './logger.mjs'

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.startTimes = new Map()
  }

  // 성능 측정 시작
  start(label) {
    this.startTimes.set(label, process.hrtime.bigint())
  }

  // 성능 측정 종료 및 기록
  end(label) {
    const startTime = this.startTimes.get(label)
    if (!startTime) {
      logger.warn(`Performance measurement not started for: ${label}`)
      return
    }

    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1000000 // 나노초를 밀리초로 변환

    this.startTimes.delete(label)
    
    // 메트릭 저장
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    
    const measurements = this.metrics.get(label)
    measurements.push({
      duration,
      timestamp: new Date(),
    })

    // 최근 100개 측정값만 유지
    if (measurements.length > 100) {
      measurements.shift()
    }

    logger.debug(`Performance: ${label} took ${duration.toFixed(2)}ms`)
    
    return duration
  }

  // 평균 성능 조회
  getAverage(label) {
    const measurements = this.metrics.get(label)
    if (!measurements || measurements.length === 0) {
      return null
    }

    const sum = measurements.reduce((acc, m) => acc + m.duration, 0)
    return sum / measurements.length
  }

  // 모든 메트릭 조회
  getAllMetrics() {
    const result = {}
    
    for (const [label, measurements] of this.metrics) {
      if (measurements.length > 0) {
        const durations = measurements.map(m => m.duration)
        result[label] = {
          count: measurements.length,
          average: durations.reduce((a, b) => a + b, 0) / durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations),
          latest: durations[durations.length - 1],
        }
      }
    }
    
    return result
  }

  // 메모리 사용량 모니터링
  getMemoryUsage() {
    const usage = process.memoryUsage()
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    }
  }

  // CPU 사용량 모니터링
  getCpuUsage() {
    return {
      uptime: process.uptime(),
      loadAverage: require('os').loadavg(),
    }
  }

  // 시스템 상태 요약
  getSystemStatus() {
    return {
      memory: this.getMemoryUsage(),
      cpu: this.getCpuUsage(),
      performance: this.getAllMetrics(),
      timestamp: new Date(),
    }
  }

  // 정기적인 상태 로깅
  startPeriodicLogging(intervalMs = 60000) {
    setInterval(() => {
      const status = this.getSystemStatus()
      logger.info('System Status:', {
        memory: `${status.memory.heapUsed}MB / ${status.memory.heapTotal}MB`,
        uptime: `${Math.round(status.cpu.uptime)}s`,
        performanceMetrics: Object.keys(status.performance).length,
      })
    }, intervalMs)
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor()
