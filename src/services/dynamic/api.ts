import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm';

export default class DynamicApiService {
    constructor(private readonly client: DynamicEvmWalletClient) {}

    static async initialize(environmentId: string, apiKey: string) {
        const client = new DynamicEvmWalletClient({
            environmentId,
            enableMPCAccelerator: true,
        });

        return new DynamicApiService(client);
    }
}

