export const SUPPORTED_CHAINS = [
    "sepolia",
    "avalanche_fuji",
] as const;

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];