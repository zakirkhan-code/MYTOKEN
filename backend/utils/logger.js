// utils/logger.js - Logging Utility
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ============================================
// LOG LEVELS
// ============================================

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  TRACE: 'TRACE'
};

// ============================================
// COLOR CODES FOR CONSOLE
// ============================================

const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  GREEN: '\x1b[32m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  GRAY: '\x1b[90m'
};

// ============================================
// LOG CONFIGURATION
// ============================================

const LOG_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  enableConsole: process.env.NODE_ENV !== 'production',
  enableFile: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10
};

// ============================================
// LOGGER CLASS
// ============================================

class Logger {
  constructor(config = LOG_CONFIG) {
    this.config = config;
    this.logLevelIndex = {
      TRACE: 0,
      DEBUG: 1,
      INFO: 2,
      WARN: 3,
      ERROR: 4
    };
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    
    let formatted = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        formatted += ` ${JSON.stringify(data, null, 2)}`;
      } else {
        formatted += ` ${data}`;
      }
    }

    return formatted;
  }

  getColorCode(level) {
    const colorMap = {
      ERROR: COLORS.RED,
      WARN: COLORS.YELLOW,
      INFO: COLORS.GREEN,
      DEBUG: COLORS.BLUE,
      TRACE: COLORS.GRAY
    };
    return colorMap[level] || COLORS.RESET;
  }

  shouldLog(level) {
    const currentLevel = this.logLevelIndex[this.config.level.toUpperCase()] || this.logLevelIndex.INFO;
    const messageLevel = this.logLevelIndex[level] || this.logLevelIndex.INFO;
    return messageLevel >= currentLevel;
  }

  writeToFile(level, formattedMessage) {
    if (!this.config.enableFile) return;

    const filename = path.join(logsDir, `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`);

    try {
      // Check file size
      if (fs.existsSync(filename)) {
        const stats = fs.statSync(filename);
        if (stats.size > this.config.maxFileSize) {
          // Archive old file
          const timestamp = Date.now();
          fs.renameSync(filename, `${filename}.${timestamp}`);
          
          // Clean old archives
          this.cleanOldLogs(filename);
        }
      }

      fs.appendFileSync(filename, formattedMessage + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  cleanOldLogs(basePath) {
    try {
      const dir = path.dirname(basePath);
      const files = fs.readdirSync(dir)
        .filter(f => f.startsWith(path.basename(basePath)))
        .sort()
        .reverse();

      if (files.length > this.config.maxFiles) {
        files.slice(this.config.maxFiles).forEach(f => {
          fs.unlinkSync(path.join(dir, f));
        });
      }
    } catch (error) {
      console.error('Error cleaning old logs:', error);
    }
  }

  logToConsole(level, message, data, color) {
    if (!this.config.enableConsole) return;

    const emoji = {
      ERROR: '❌',
      WARN: '⚠️',
      INFO: 'ℹ️',
      DEBUG: '🐛',
      TRACE: '📍'
    };

    const prefix = `${emoji[level] || ''} ${color}[${level}]${COLORS.RESET}`;
    
    if (data) {
      if (typeof data === 'object') {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message} ${data}`);
      }
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  // ============================================
  // PUBLIC LOGGING METHODS
  // ============================================

  log(level, message, data = null) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, data);
    const color = this.getColorCode(level);

    this.logToConsole(level, message, data, color);
    this.writeToFile(level, formattedMessage);
  }

  error(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  trace(message, data = null) {
    this.log(LOG_LEVELS.TRACE, message, data);
  }

  // ============================================
  // SPECIALIZED LOGGING METHODS
  // ============================================

  logRequest(req) {
    const info = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 100)
    };
    this.debug(`Incoming request`, info);
  }

  logResponse(req, res, duration) {
    const info = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`
    };
    
    if (res.statusCode >= 400) {
      this.warn(`Response error`, info);
    } else {
      this.debug(`Response sent`, info);
    }
  }

  logDatabase(action, collection, duration) {
    const info = {
      action,
      collection,
      duration: `${duration}ms`
    };
    this.debug(`Database operation`, info);
  }

  logTransaction(txHash, status, data = {}) {
    const info = {
      txHash: txHash.substring(0, 10) + '...',
      status,
      ...data
    };
    this.info(`Transaction event`, info);
  }

  logSecurity(event, user, details = {}) {
    const info = {
      event,
      user,
      timestamp: this.getTimestamp(),
      ...details
    };
    this.warn(`Security event`, info);
  }

  // ============================================
  // FILE READING METHODS
  // ============================================

  readLogs(level, days = 1) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const filename = path.join(logsDir, `${level.toLowerCase()}-${startDate.toISOString().split('T')[0]}.log`);

      if (!fs.existsSync(filename)) {
        return [];
      }

      const content = fs.readFileSync(filename, 'utf8');
      return content.split('\n').filter(line => line.trim());
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  }

  getAllLogs(days = 1) {
    const logs = {};
    Object.values(LOG_LEVELS).forEach(level => {
      logs[level.toLowerCase()] = this.readLogs(level, days);
    });
    return logs;
  }
}

// ============================================
// MIDDLEWARE FOR REQUEST/RESPONSE LOGGING
// ============================================

const requestLogger = (logger) => (req, res, next) => {
  const start = Date.now();

  logger.logRequest(req);

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logResponse(req, res, duration);
  });

  next();
};

// ============================================
// EXPORT
// ============================================

const logger = new Logger();

module.exports = logger;
module.exports.Logger = Logger;
module.exports.requestLogger = requestLogger;