import { createLogger } from './utils/logger.js';
import { config } from './utils/config.js';
import { closeConnection } from './services/db/mongo.js';
import initModels from './services/db/models.js';
import { getWalletManager } from './services/wallet/index.js';

const logger = createLogger();

async function startServer() {
    try {
        logger.info('Initializing MongoDB connection...');
        const db = await initModels();
        logger.info('Initializing Wallet manager...');
        await getWalletManager(db, config);
        const { default: app } = await import('./server.js');
        const server = app.listen(config.port, config.host, () => {
            logger.info(`Server is running on ${config.host}:${config.port}`);
        });

        return server;
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

const server = await startServer();

const shutdown = async () => {
    await closeConnection();
    server.close(() => {
        logger.info('Server is shutting down');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Server is forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
