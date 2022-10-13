import { BigNumber } from "ethers";

export type Transaction = {
    blockHash: string;
    blockNumber: number;
    byzantium: boolean;
    confirmations: number;
    contractAddress: string | null;
    cumulativeGasUsed: BigNumber;
    effectiveGasPrice: BigNumber;
    events: Event[];
    from: string;
    gasUsed: BigNumber;
    logs: Log[];
    logsBloom: string;
    status: number;
    to: string;
    transactionHash: string;
    transactionIndex: number;
    type: number;
}

export type Event = {
    address: string;
    args: {
        [key: number] : string | BigNumber;
        approved: string;
        owner: string;
        tokenId: BigNumber;
    };
    blockHash: string;
    blockNumber: number;
    data: string;
    decode: () => void;
    event: string;
    eventSignature: string;
    getBlock: () => void;
    getTransaction: () => void;
    getTransactionReceipt: () => Promise<any>;
    logIndex: number;
    removeListener: () => any;
    topics: string[];
    transactionHash: string;
    transactionIndex: number;
}

export type Log = {
    address: string;
    blockHash: string;
    blockNumber: number;
    data: string;
    logIndex: number;
    topics: string[];
    transactionHash: string;
    transactionIndex: number;
}