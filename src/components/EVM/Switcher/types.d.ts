import React from "react"
import { ChainConfig } from "../ChainConfigs/types";

export type ButtonProps = {
    targetChain: ChainConfig;
    handleChainChange: (chainId: string) => void;
    currentChainId?: string; // to link other switchers
    children?: JSX.Element | JSX.Element[];
    hide?: boolean;
    disabled?: boolean;
    style?: React.CSSProperties;
    className?: string;
    handleUserRejection?: () => void;
    handleUnknownError?: () => void;
}