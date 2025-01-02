import fs from 'fs/promises';
import path from 'path';

class Logger {
    constructor(options = {}) {
        this.logDir = options.logDir || 'logs';
        this.logFile = options.logFile || 'server.log';
        this.logLevel = options.logLevel || 'info'; // debug, info, warn, error
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        
        // Create logs directory if it doesn't exist
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.logDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create log directory:', error);
        }
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    async writeToFile(message) {
        try {
            const logPath = path.join(this.logDir, this.logFile);
            await fs.appendFile(logPath, message + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    shouldLog(level) {
        return this.levels[level] >= this.levels[this.logLevel];
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = this.getTimestamp();
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`.trim();
    }

    async log(level, message, meta = {}) {
        if (!this.shouldLog(level)) return;
        
        const formattedMessage = this.formatMessage(level, message, meta);
        console.log(formattedMessage);
        await this.writeToFile(formattedMessage);
    }

    async debug(message, meta = {}) {
        await this.log('debug', message, meta);
    }

    async info(message, meta = {}) {
        await this.log('info', message, meta);
    }

    async warn(message, meta = {}) {
        await this.log('warn', message, meta);
    }

    async error(message, meta = {}) {
        await this.log('error', message, meta);
    }
}

export default Logger;