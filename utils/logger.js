// Small logger helper - beginners can replace console with more advanced loggers later
const prefix = '[Framework]';
function info(...args) { console.log(prefix, 'INFO', ...args); }
function warn(...args) { console.warn(prefix, 'WARN', ...args); }
function error(...args) { console.error(prefix, 'ERROR', ...args); }

module.exports = { info, warn, error };
