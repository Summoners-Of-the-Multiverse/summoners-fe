import React from "react"
import { ChainConfig } from "../ChainConfigs/types";

export type ButtonProps = {
    targetChain: ChainConfig;
    handleChainChange: (chainId: string) => void;
    text?: string;
    hide?: boolean;
    disabled?: boolean;
    style?: React.CSSProperties;
    className?: string;
}