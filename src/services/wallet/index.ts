import { Config } from '../../config/index.js';
import BaseWalletManager from './base_manager.js';
import DynamicWalletManager from './dynamic_manager.js';
import LocalWalletManager from './local_manager.js';
import { createLogger } from '../../utils/logger.js';
import DbService from '../db/db_service.js';

const logger = createLogger();

let walletManager: Promise<BaseWalletManager> | undefined;
export async function getWalletManager(
    dbService: DbService,
    config: Config
): Promise<BaseWalletManager> {
    if (walletManager) {
        return await walletManager;
    }
    if (config.dynamicLabs.apiKey) {
        walletManager = DynamicWalletManager.initialize(
            dbService,
            config.dynamicLabs.environmentId,
            config.dynamicLabs.apiKey,
            config.env === 'development'
        );
        logger.info('Dynamic API connection initialized');
    } else {
        walletManager = LocalWalletManager.initialize(dbService);
        logger.info('Local database connection initialized');
    }
    return await walletManager;
}
