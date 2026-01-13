import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import { config } from '../../utils/config.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger();

const client = new MongoClient(config.mongodb.uri || '', {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    maxPoolSize: 10,
    minPoolSize: 2,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
});

let connection: MongoClient | undefined;
let db: Db | undefined;
let connectionPromise: Promise<MongoClient> | undefined;

async function getConnection(): Promise<MongoClient> {
    if (connection) {
        return connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = (async () => {
        try {
            if (!config.mongodb.uri) {
                throw new Error('MONGODB_URI is not configured');
            }

            await client.connect();
            connection = client;
            logger.info('MongoDB connection established');
            return connection;
        } catch (error) {
            connectionPromise = undefined; // Reset on error so we can retry
            logger.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    })();

    return connectionPromise;
}

export async function getDb(dbName?: string): Promise<Db> {
    if (db && !dbName) {
        return db;
    }

    const client = await getConnection();
    const database = dbName ? client.db(dbName) : client.db();

    if (!dbName) {
        db = database; // Cache default database
    }

    return database;
}

export async function isConnected(): Promise<boolean> {
    try {
        if (!connection) {
            return false;
        }
        // Ping the database to check connection
        await connection.db().admin().ping();
        return true;
    } catch {
        return false;
    }
}

export async function closeConnection(): Promise<void> {
    if (connection) {
        try {
            await connection.close();
            logger.info('MongoDB connection closed');
        } catch (error) {
            logger.error('Error closing MongoDB connection:', error);
            throw error;
        } finally {
            connection = undefined;
            db = undefined;
            connectionPromise = undefined;
        }
    }
}
