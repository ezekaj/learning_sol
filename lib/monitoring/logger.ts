import winston from 'winston';
import { env, isProduction, isDevelopment } from '@/lib/config/environment';

/**
 * Comprehensive Logging System
 * Structured logging with multiple transports and log levels
 */

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
  endpoint?: string;
  method?: string;
  duration?: number;
  statusCode?: number;
  error?: Error;
  metadata?: Record<string, any>;
  // Additional properties for comprehensive logging
  count?: number;
  query?: string;
  service?: string;
  operation?: string;
  tokens?: number;
  success?: boolean;
  event?: string;
  metrics?: Record<string, any>;
  events?: number;
  critical?: number;
  high?: number;
  completions?: number;
  achievements?: number;
  securityEvent?: any;
  learningEvent?: any;
}

interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'csrf_violation' | 'session_hijack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
}

interface LearningEvent {
  type: 'lesson_start' | 'lesson_complete' | 'code_submit' | 'achievement_unlock' | 'collaboration_join';
  userId: string;
  lessonId?: string;
  achievementId?: string;
  sessionId?: string;
  progress?: number;
  score?: number;
  metadata?: Record<string, any>;
}

class Logger {
  private winston: winston.Logger;
  private performanceMetrics: PerformanceMetrics[] = [];
  private securityEvents: SecurityEvent[] = [];
  private learningEvents: LearningEvent[] = [];

  constructor() {
    this.winston = this.createWinstonLogger();
    this.setupPeriodicFlush();
  }

  /**
   * Create Winston logger with appropriate transports
   */
  private createWinstonLogger(): winston.Logger {
    const transports: winston.transport[] = [];

    // Console transport for development
    if (isDevelopment) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          ),
        })
      );
    }

    // File transports for production
    if (isProduction) {
      // General application logs
      transports.push(
        new winston.transports.File({
          filename: 'logs/app.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
        })
      );

      // Error logs
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
        })
      );

      // Security logs
      transports.push(
        new winston.transports.File({
          filename: 'logs/security.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 10,
        })
      );
    }

    return winston.createLogger({
      level: env.LOG_LEVEL,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports,
      exitOnError: false,
    });
  }

  /**
   * Setup periodic flush of metrics and events
   */
  private setupPeriodicFlush(): void {
    // Flush metrics every 5 minutes
    setInterval(() => {
      this.flushMetrics();
    }, 5 * 60 * 1000);

    // Flush events every minute
    setInterval(() => {
      this.flushEvents();
    }, 60 * 1000);
  }

  /**
   * Log with context
   */
  private logWithContext(level: string, message: string, context: LogContext = {}): void {
    const logData = {
      message,
      timestamp: new Date().toISOString(),
      level,
      ...context,
    };

    this.winston.log(level, message, logData);
  }

  /**
   * Info level logging
   */
  info(message: string, context: LogContext = {}): void {
    this.logWithContext('info', message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context: LogContext = {}): void {
    this.logWithContext('warn', message, context);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, context: LogContext = {}): void {
    this.logWithContext('error', message, { ...context, error });
  }

  /**
   * Debug level logging
   */
  debug(message: string, context: LogContext = {}): void {
    this.logWithContext('debug', message, context);
  }

  /**
   * Log API request
   */
  logRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    context: LogContext = {}
  ): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this.logWithContext(level, `${method} ${endpoint}`, {
      ...context,
      method,
      endpoint,
      statusCode,
      duration,
    });
  }

  /**
   * Log authentication event
   */
  logAuth(
    event: 'login' | 'logout' | 'register' | 'password_reset' | 'oauth_callback',
    success: boolean,
    context: LogContext = {}
  ): void {
    const level = success ? 'info' : 'warn';
    this.logWithContext(level, `Authentication: ${event}`, {
      ...context,
      event,
      success,
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push({
      ...metrics,
      timestamp: Date.now(),
    } as any);

    // Log slow operations immediately
    if (metrics.duration > 5000) { // 5 seconds
      this.warn(`Slow operation detected: ${metrics.operation}`, {
        duration: metrics.duration,
        metadata: metrics.metadata,
      });
    }
  }

  /**
   * Log security event
   */
  logSecurity(event: SecurityEvent): void {
    this.securityEvents.push({
      ...event,
      timestamp: Date.now(),
    } as any);

    const level = event.severity === 'critical' || event.severity === 'high' ? 'error' : 'warn';
    this.logWithContext(level, `Security event: ${event.type}`, {
      securityEvent: event,
    });

    // Immediate alert for critical security events
    if (event.severity === 'critical') {
      this.alertCriticalSecurity(event);
    }
  }

  /**
   * Log learning analytics event
   */
  logLearning(event: LearningEvent): void {
    this.learningEvents.push({
      ...event,
      timestamp: Date.now(),
    } as any);

    this.info(`Learning event: ${event.type}`, {
      learningEvent: event,
    });
  }

  /**
   * Log database query performance
   */
  logQuery(
    query: string,
    duration: number,
    success: boolean,
    context: LogContext = {}
  ): void {
    const level = success ? 'debug' : 'error';
    this.logWithContext(level, 'Database query', {
      ...context,
      query: query.substring(0, 200), // Truncate long queries
      duration,
      success,
    });

    // Track slow queries
    if (duration > 1000) { // 1 second
      this.warn('Slow database query detected', {
        query: query.substring(0, 200),
        duration,
      });
    }
  }

  /**
   * Log AI service interaction
   */
  logAI(
    service: 'openai' | 'google' | 'custom',
    operation: string,
    tokens: number,
    duration: number,
    success: boolean,
    context: LogContext = {}
  ): void {
    this.info(`AI service: ${service} - ${operation}`, {
      ...context,
      service,
      operation,
      tokens,
      duration,
      success,
    });

    // Track AI usage metrics
    this.logPerformance({
      operation: `ai_${service}_${operation}`,
      duration,
      success,
      metadata: { tokens, service },
    });
  }

  /**
   * Log collaboration event
   */
  logCollaboration(
    event: 'session_create' | 'session_join' | 'session_leave' | 'code_change' | 'message_send',
    sessionId: string,
    context: LogContext = {}
  ): void {
    this.info(`Collaboration: ${event}`, {
      ...context,
      event,
      sessionId,
    });
  }

  /**
   * Flush performance metrics
   */
  private flushMetrics(): void {
    if (this.performanceMetrics.length === 0) return;

    const metrics = [...this.performanceMetrics];
    this.performanceMetrics = [];

    // Calculate aggregated metrics
    const aggregated = this.aggregateMetrics(metrics);
    
    this.info('Performance metrics summary', {
      metrics: aggregated,
      count: metrics.length,
    });

    // Send to external monitoring service if configured
    this.sendToMonitoring('performance', aggregated);
  }

  /**
   * Flush events
   */
  private flushEvents(): void {
    if (this.securityEvents.length > 0) {
      const events = [...this.securityEvents];
      this.securityEvents = [];
      
      this.info('Security events summary', {
        events: events.length,
        critical: events.filter(e => e.severity === 'critical').length,
        high: events.filter(e => e.severity === 'high').length,
      });

      this.sendToMonitoring('security', events);
    }

    if (this.learningEvents.length > 0) {
      const events = [...this.learningEvents];
      this.learningEvents = [];
      
      this.info('Learning events summary', {
        events: events.length,
        completions: events.filter(e => e.type === 'lesson_complete').length,
        achievements: events.filter(e => e.type === 'achievement_unlock').length,
      });

      this.sendToMonitoring('learning', events);
    }
  }

  /**
   * Aggregate performance metrics
   */
  private aggregateMetrics(metrics: PerformanceMetrics[]): Record<string, any> {
    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = [];
      }
      acc[metric.operation].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetrics[]>);

    const aggregated: Record<string, any> = {};

    for (const [operation, operationMetrics] of Object.entries(grouped)) {
      const durations = operationMetrics.map(m => m.duration);
      const successCount = operationMetrics.filter(m => m.success).length;

      aggregated[operation] = {
        count: operationMetrics.length,
        successRate: successCount / operationMetrics.length,
        avgDuration: durations.reduce((a: number, b) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        p95Duration: this.percentile(durations, 0.95),
      };
    }

    return aggregated;
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }

  /**
   * Send data to external monitoring service
   */
  private sendToMonitoring(type: string, data: any): void {
    // This would integrate with services like DataDog, New Relic, etc.
    if (env.SENTRY_DSN) {
      // Send to Sentry for error tracking
      console.log(`Sending ${type} data to monitoring service:`, data);
    }
  }

  /**
   * Alert for critical security events
   */
  private alertCriticalSecurity(event: SecurityEvent): void {
    // This would send alerts via email, Slack, PagerDuty, etc.
    console.error('CRITICAL SECURITY ALERT:', event);
    
    // In production, this would trigger immediate notifications
    if (isProduction) {
      // Send to alerting service
      this.sendToMonitoring('critical_alert', event);
    }
  }

  /**
   * Get logger statistics
   */
  getStats(): {
    pendingMetrics: number;
    pendingSecurityEvents: number;
    pendingLearningEvents: number;
    logLevel: string;
  } {
    return {
      pendingMetrics: this.performanceMetrics.length,
      pendingSecurityEvents: this.securityEvents.length,
      pendingLearningEvents: this.learningEvents.length,
      logLevel: env.LOG_LEVEL,
    };
  }
}

// Create singleton instance
export const logger = new Logger();

/**
 * Performance monitoring decorator
 */
export function withPerformanceLogging(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      let success = true;
      let error: Error | undefined;

      try {
        const result = await method.apply(this, args);
        return result;
      } catch (err) {
        success = false;
        error = err as Error;
        throw err;
      } finally {
        const duration = Date.now() - start;
        logger.logPerformance({
          operation: `${target.constructor.name}.${propertyName}`,
          duration,
          success,
          metadata: { operation, error: error?.message },
        });
      }
    };

    return descriptor;
  };
}

/**
 * Request logging middleware
 */
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();

    // Add request ID to headers
    res.setHeader('X-Request-ID', requestId);

    // Log request start
    logger.info('Request started', {
      requestId,
      method: req.method,
      endpoint: req.url,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.logRequest(
        req.method,
        req.url,
        res.statusCode,
        duration,
        {
          requestId,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
        }
      );
    });

    next();
  };
}

// Export types and utilities
export type {
  LogContext,
  PerformanceMetrics,
  SecurityEvent,
  LearningEvent,
};
