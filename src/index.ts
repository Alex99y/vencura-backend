import { createLogger } from './utils/logger.js';
import { config } from './config/index.js';
import { closeConnection } from './services/db/mongo.js';
import { getWalletManager } from './services/wallet/index.js';
import DbService from './services/db/db_service.js';
import getApp from './server.js';

const logger = createLogger();

async function startServer() {
    try {
        logger.info('Initializing MongoDB connection...');
        const dbService = await DbService.getDbService();
        logger.info('Initializing Wallet manager...');
        const walletManager = await getWalletManager(dbService, config);
        const app = getApp(dbService, walletManager);
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
