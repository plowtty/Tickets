import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import prisma from './config/database';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

// Graceful shutdown — cerrar conexiones limpias antes de terminar el proceso
// Buena práctica: evita requests colgadas y corrupción de datos en Kubernetes/Docker
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    await prisma.$disconnect();
    logger.info('Database connection closed');

    process.exit(0);
  });

  // Force close después de 10s si no cierra limpiamente
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

export default server;
