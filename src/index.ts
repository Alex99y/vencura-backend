import app from './server.js';
import { createLogger } from './utils/logger.js';
import { config } from './utils/config.js';
import { closeConnection } from './services/db/mongo.js';
import initModels from './services/db/models.js';
import DynamicApiService from './services/dynamic/api.js';

const logger = createLogger();

async function startServer() {
    try {
        await initModels();
        logger.info('MongoDB connection initialized');

        await DynamicApiService.initialize(
            config.dynamicLabs.environmentId,
            config.dynamicLabs.apiKey
        );
        logger.info('Dynamic API connection initialized');

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
