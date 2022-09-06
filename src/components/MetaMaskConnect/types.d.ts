export type ChainConfig = {
    name: string;
    shortName: string;
    id: string;
    rpc: string;
}

export type ButtonProps = {
    handleNewAccount: (address: string) => void;
    handleChainChange: (chainId: string) => void; //hex id
}