import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

// Utils
import { config } from './config/index.js';
import { createLogger } from './utils/logger.js';

// Routes
import accountsRouter from './routes/accounts/accounts.router.js';
import operationsRouter from './routes/operations/operations.router.js';

// Middlewares
import { errorHandler } from './middlewares/error_handler.js';
import AccountsController from './routes/accounts/accounts.controller.js';
import AccountsService from './routes/accounts/accounts.service.js';
import type BaseWalletManager from './services/wallet/base_manager.js';
import EvmService from './services/chain/evm_service.js';
import type DbService from './services/db/db_service.js';
import OperationsService from './routes/operations/operations.service.js';
import OperationsController from './routes/operations/operations.controller.js';

export default function (
    dbService: DbService,
    walletManager: BaseWalletManager
) {
    const logger = createLogger();

    const morganStream = {
        write: (message: string) => {
            logger.info(message.trim()); // Use logger.info inside the write function
        },
    };

    const app: express.Express = express();

    app.use(helmet());

    app.use(
        cors({
            origin: config.cors,
            credentials: true,
        })
    );

    app.use(
        rateLimit({
            ...config.rateLimit,
            validate: { xForwardedForHeader: false },
        })
    );

    app.use(morgan('dev', { stream: morganStream }));

    app.use(express.json());

    // Initialize controllers
    const evmService = new EvmService();
    const accountsService = new AccountsService(
        dbService,
        walletManager,
        evmService
    );
    const accountsController = new AccountsController(accountsService);

    const operationsService = new OperationsService(dbService, walletManager);
    const operationsController = new OperationsController(operationsService);

    app.use('/api/v1', [
        accountsRouter(accountsController),
        operationsRouter(operationsController),
    ]);

    app.use(errorHandler);

    return app;
}
