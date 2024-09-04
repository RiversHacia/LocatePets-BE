const winston = require('winston');
const dotenv = require('dotenv');

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Add console transport only in non-production environments
if (process.env.SERVER_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const invalidUseLogger = (routeHandlerName, routeHandlerMethod, req) => {
  const { userId = 'Undetected' } = req.body || {};
  const clientIp = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown'; // Provide a fallback if User-Agent is not present

  const message = `UserID: ${userId}, IP: ${clientIp}, User-Agent: ${userAgent} --- Invalid use of ${routeHandlerName} in ${routeHandlerMethod} method`;
  logger.error(message);
};

module.exports = {
  logger,
  invalidUseLogger,
};
