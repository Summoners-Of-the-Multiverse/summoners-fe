export type ButtonProps = {
    handleNewAccount: (address: string) => void;
    handleChainChange: (chainId: string) => void; //hex id
    onFinishLoading: () => void;
    hide?: boolean;
}