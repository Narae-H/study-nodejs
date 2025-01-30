/**
 * loggerConfig.js: 로그 관리
 * 역할:
 *  - 로그 형식 설정(winston.format)
 *  - 로그 레벨 설정 (error > warn > info > http > verbose > debug > silly)
 * 책임범위:
 *  - 로그 형식 관리
 *  - 에러 핸들링 개선
 *  - 로그 출력 대상 관리
 */

const winston = require('winston');
const config = require('./config');

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

module.exports = logger;