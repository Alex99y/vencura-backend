import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import { createLogger } from "../utils/logger.js"
import { ZodError } from "zod"
import { ClientError } from "../utils/errors.js"

const logger = createLogger()

export const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
        return res.status(400).json({ message: "Validation Error", errors: err.issues.map(issue => issue.message) })
    }
    if (err instanceof ClientError) {
        return res.status(err.statusCode).json({ message: err.message })
    }
    logger.error(err.stack)
    return res.status(500).json({ message: "Internal Server Error. Please, report this issue to the administrator." })
}