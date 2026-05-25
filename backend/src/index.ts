import { Server } from 'http';
import app from './app';
import prisma from './client';
import config from './config/config';
import logger from './config/logger';

let server: Server;

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to SQL Database');

    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

const shutdown = async (exitCode: number) => {
  try {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.info('Server closed');
          resolve();
        });
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    logger.error(error);
  } finally {
    process.exit(exitCode);
  }
};

startServer();

const exitHandler = () => {
  void shutdown(1);
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  void shutdown(0);
});
