// utils/logger.js
// ---------------------------------------------------------------
// Centralised Winston logger used throughout the framework.
// Logs go to the console AND to a rotating file in logs/.
//
// Log levels (from highest to lowest priority):
//   error > warn > info > http > verbose > debug > silly
// ---------------------------------------------------------------

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Make sure the logs directory exists before Winston tries to write to it.
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = createLogger({
  // Change to 'debug' for verbose output during local development.
  level: process.env.LOG_LEVEL || 'info',

  format: format.combine(
    // Attach a timestamp to every log message.
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // Add colour to console output.
    format.colorize(),
    // Human-readable format: "2024-01-01 12:00:00 [INFO]: message"
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),

  transports: [
    // Write every log level to the console.
    new transports.Console(),

    // Also persist logs to a file (one file per day via date-based suffix).
    new transports.File({
      filename: path.join(logsDir, 'framework.log'),
      // Strip ANSI colour codes from file output.
      format: format.combine(format.uncolorize(), format.timestamp(), format.json()),
    }),

    // Separate file for errors only, so errors are easy to find.
    new transports.File({
      filename: path.join(logsDir, 'errors.log'),
      level: 'error',
      format: format.combine(format.uncolorize(), format.timestamp(), format.json()),
    }),
  ],
});

module.exports = logger;
