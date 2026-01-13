import * as viem from "viem"

export const isValidEvmAddress = (address: string) => {
    return viem.isAddress(address)
}