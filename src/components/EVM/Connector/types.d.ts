import React from "react";

export type ButtonProps = {
    handleNewAccount: (address: string) => void;
    handleChainChange: (chainId: string) => void; //hex id
    onFinishLoading: () => void;
    hide?: boolean;
    children?: JSX.Element | JSX.Element[];
    style?: React.CSSProperties;
    className?: string;
}