import app from "./server.js"
import { createLogger } from "./utils/logger.js"
import { config } from "./utils/config.js"

const logger = createLogger()

const server = app.listen(config.port, config.host, () => {
  logger.info(`Server is running on ${config.host}:${config.port}`)
})

const shutdown = () => {
  server.close(() => {
    logger.info("Server is shutting down")
    process.exit(0)
  })
  setTimeout(() => {
    logger.error("Server is forcefully shutting down")
    process.exit(1)
  }, 10000)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)