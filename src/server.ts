import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'

// Utils
import { config } from './utils/config.js'
import { createLogger } from './utils/logger.js'

// Routes
import accountsRouter from './routes/accounts/accounts.router.js'

// Middlewares
import { errorHandler } from './middlewares/errorHandler.js'


const logger = createLogger()

const morganStream = {
  write: (message) => {
    logger.info(message.trim()); // Use logger.info inside the write function
  },
};

const app = express()

app.use(helmet())

app.use(cors({
  origin: config.cors,
  credentials: true,
}))

app.use(rateLimit(config.rateLimit))

app.use(morgan('dev', { stream: morganStream }))

app.use(express.json());

app.use('/api/v1', [
  accountsRouter
])

app.use(errorHandler)

export default app
