import winston from 'winston';

const myFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const console = new winston.transports.Console({
  format: winston.format.combine(winston.format.timestamp(), myFormat),
  level: process.env.NODE_ENV !== 'production' ? 'verbose' : 'info'
});

winston.add(console);

export default winston;