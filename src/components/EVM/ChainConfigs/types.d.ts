export type ChainConfig = {
    name: string;
    shortName: string;
    id: string;
    evmChain?: string;
    rpc: string;
    nativeCurrency: {
        name: string;
        decimals: number;
        symbol: string;
    };
    blockExplorerUrl?: string;
    linkerContract?: string;
    nftContract?: string;
}