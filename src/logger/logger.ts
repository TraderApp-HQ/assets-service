
import winston from 'winston';
import dotenv from "dotenv";

//init env variables
dotenv.config();

const { format } = require("winston");
const { combine, timestamp, label, printf } = format;
const SERVICE = process.env.SERVICE || 'unknown-service';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

const transports = {
  console: new winston.transports.Console({ level: 'info' })
};

const customFormat = printf(({ level, message, timestamp }: { level: string, message: string, timestamp: string}) => {
    return `${level}: ${message} [${SERVICE}] ${ENVIRONMENT} ${timestamp}`;
  });


  winston.loggers.add('grafana', {
    format: combine(winston.format.colorize(), format.errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
    transports: [
        transports.console,
      ],
      exceptionHandlers: [
        new winston.transports.File({ filename: 'exceptions.log' })
      ]
  });

  winston.loggers.add('cloudWatch', {
    format: combine(
      label({ label: SERVICE }),
      timestamp(),
      customFormat
    ),
    transports: [
        transports.console,
      ],
      exceptionHandlers: [
        new winston.transports.File({ filename: 'exceptions.log' })
      ]
  });

  class logger {

    grafana: winston.Logger;
    cloudWatch: winston.Logger;
    constructor() {
      this.grafana = winston.loggers.get('grafana');
      this.cloudWatch = winston.loggers.get('cloudWatch');
    }

    info(message: any){
        transports.console.level = "info"
        this.grafana.info(message)
    }

    warn(message: any):void{
        transports.console.level = "warn"
        this.grafana.warn(message)
    }

    error(message: any):void{
        transports.console.level = "error"
        this.grafana.error(message)
    }

    debug(message: any): void{
        transports.console.level = "debug"
        this.grafana.log(transports.console.level, message)
    }

    log(message: any) : void{
      transports.console.level = "info"
      this.grafana.log(transports.console.level, message)
    }

  }

  export default new logger();