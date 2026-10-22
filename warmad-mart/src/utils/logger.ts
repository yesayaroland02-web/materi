import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

// format kustom tampilan log
const customFormat = printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(),
    customFormat,
  ),
  transports: [new winston.transports.Console()],
});