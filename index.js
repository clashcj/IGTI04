import express from 'express';
import winston from 'winston';
import accountsRouter from './routes/accounts.js';
import gradesRouter from './routes/grades.js';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;

global.fileName = 'accounts.json';
global.fileNameGrades = 'grades.json';

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'my-bank-api.log' }),
  ],
  format: combine(label({ label: 'my-bank-api' }), timestamp(), myFormat),
});

global.loggerGrades = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

let port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use('/account', accountsRouter);
app.use('/grades', gradesRouter);

app.listen(port, async () => {
  try {
    await readFile(global.fileName);
    logger.info('API Started on port: ' + port);
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    writeFile(global.fileName, JSON.stringify(initialJson))
      .then(() => {
        logger.info('API Started and File Created');
      })
      .catch((err) => {
        logger.error(err);
      });
  }
});
