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
    rateLimit({ ...config.rateLimit, validate: { xForwardedForHeader: false } })
);

app.use(morgan('dev', { stream: morganStream }));

app.use(express.json());

app.use('/api/v1', [accountsRouter, operationsRouter]);

app.use(errorHandler);

export default app;
