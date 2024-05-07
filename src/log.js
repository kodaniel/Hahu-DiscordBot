const winston = require('winston');

const files = new winston.transports.File({ filename: 'combined.log' });
winston.add(files);

if (process.env.NODE_ENV !== 'production') {
  const console = new winston.transports.Console();
  winston.add(console);
}

module.exports = winston;