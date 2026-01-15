import { Config } from '../../config/index.js';
import BaseWalletManager from './base_manager.js';
import DynamicWalletManager from './dynamic_manager.js';
import LocalWalletManager from './local_manager.js';
import { createLogger } from '../../utils/logger.js';
import { Db } from 'mongodb';

const logger = createLogger();

let walletManager: Promise<BaseWalletManager> | undefined;
export async function getWalletManager(
    db: Db,
    config: Config
): Promise<BaseWalletManager> {
    if (walletManager) {
        return await walletManager;
    }
    if (config.dynamicLabs.apiKey) {
        walletManager = DynamicWalletManager.initialize(
            config.dynamicLabs.environmentId,
            config.dynamicLabs.apiKey,
            config.env === 'development'
        );
        logger.info('Dynamic API connection initialized');
    } else {
        walletManager = LocalWalletManager.initialize(db);
        logger.info('Local database connection initialized');
    }
    return await walletManager;
}
