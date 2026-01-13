export default class AccountsService {
    constructor() {}

    getAccounts = async (userId: string) => {
        return [
            {
                address: '0x1234567890123456789012345678901234567890',
                alias: 'John Doe',
            },
        ];
    };

    createAccount = async (userId: string, alias: string) => {
        return {
            address: '0x1234567890123456789012345678901234567890',
            alias: alias,
        };
    };

    getAccountBalance = async (userId: string, address: string) => {
        return 0;
    };

    getAccountHistory = async (userId: string, address: string) => {
        return [address];
    };
}
