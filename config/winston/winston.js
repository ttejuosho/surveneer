const appRoot = require('app-root-path');
const winston = require('winston');

const options = {
    file: {
      level: 'info',
      name: 'file.info',
      filename: `${appRoot}/logs/app.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: true,
    },
    errorFile: {
        level: 'error',
        name: 'file.error',
        filename: `${appRoot}/logs/error.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 100,
        colorize: true,
      },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  };

  var logger = new winston.createLogger({
    transports: [
      new winston.transports.File(options.file),
      new winston.transports.File(options.errorFile),
      new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
  });

  logger.stream = {
    write: function(message, encoding) {
      logger.info(message);
    },
  };

module.exports = logger;