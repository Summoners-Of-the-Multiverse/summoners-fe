import MetaMaskOnboarding from '@metamask/onboarding';
import { ethers } from 'ethers';
import React, { useState, useEffect, useRef } from 'react';
import { ellipsizeThis } from '../../common/utils';
import { ButtonProps, ChainConfig } from './types';

const ONBOARD_TEXT = 'Click here to install MetaMask!';
const CONNECT_TEXT = 'Connect';

// chains
export const CHAIN_ETH: ChainConfig = {
    name: 'Ethereum',
    shortName: 'ETH',
    id: ethers.utils.hexlify(1),
    rpc: '',
};
export const CHAIN_BSC: ChainConfig = {
    name: 'Binance Smart Chain',
    shortName: 'BSC',
    id: ethers.utils.hexlify(56),
    rpc: 'https://bsc-dataseed3.binance.org',
};
export const CHAIN_AVAX: ChainConfig = {
    name: 'Avalanche',
    shortName: 'AVAX',
    id: ethers.utils.hexlify(43114),
    rpc: 'https://avalancheapi.terminet.io/ext/bc/C/rpc',
};
export const CHAIN_POLYGON: ChainConfig = {
    name: 'Polygon',
    shortName: 'Polygon',
    id: ethers.utils.hexlify(137),
    rpc: 'https://polygon-rpc.com',
};
export const CHAIN_ARB: ChainConfig = {
    name: 'Arbitrum',
    shortName: 'ARB',
    id: ethers.utils.hexlify(42161),
    rpc: 'https://arb1.arbitrum.io/rpc',
};
export const CHAIN_OP: ChainConfig = {
    name: 'Optimism',
    shortName: 'OP',
    id: ethers.utils.hexlify(10),
    rpc: 'https://mainnet.optimism.io',
};
export const CHAIN_CRO: ChainConfig = {
    name: 'Cronos',
    shortName: 'CRO',
    id: ethers.utils.hexlify(25),
    rpc: 'https://evm.cronos.org',
};
export const CHAIN_FTM: ChainConfig = {
    name: 'Fantom',
    shortName: 'FTM',
    id: ethers.utils.hexlify(250),
    rpc: 'https://rpc3.fantom.network',
};
export const CHAIN_KLAYTN: ChainConfig = {
    name: 'Klaytn',
    shortName: 'KLAYTN',
    id: ethers.utils.hexlify(8217),
    rpc: 'https://public-node-api.klaytnapi.com/v1/cypress	',
};
export const CHAIN_KAVA: ChainConfig = {
    name: 'Kava',
    shortName: 'KAVA',
    id: ethers.utils.hexlify(2222),
    rpc: 'https://evm2.kava.io',
};
export const CHAIN_GNO: ChainConfig = {
    name: 'Gnosis',
    shortName: 'GNO',
    id: ethers.utils.hexlify(100),
    rpc: 'https://rpc.gnosischain.com',
};
export const CHAIN_AURORA: ChainConfig = {
    name: 'Aurora',
    shortName: 'AURORA',
    id: ethers.utils.hexlify(1313161554),
    rpc: 'https://mainnet.aurora.dev',
};
export const CHAIN_HECO: ChainConfig = {
    name: 'Huobi Ecosystem',
    shortName: 'HECO',
    id: ethers.utils.hexlify(128),
    rpc: 'https://http-mainnet.hecochain.com',
};
export const CHAIN_FUSION: ChainConfig = {
    name: 'Fusion',
    shortName: 'FUSION',
    id: ethers.utils.hexlify(32659),
    rpc: 'https://mainnet.anyswap.exchange',
};
export const CHAIN_CELO: ChainConfig = {
    name: 'Celo',
    shortName: 'CELO',
    id: ethers.utils.hexlify(42220),
    rpc: 'https://forno.celo.org',
};
export const CHAIN_EVMOS: ChainConfig = {
    name: 'Evmos',
    shortName: 'EVMOS',
    id: ethers.utils.hexlify(9001),
    rpc: 'https://eth.bd.evmos.org:8545',
};
export const CHAIN_DOGE: ChainConfig = {
    name: 'Dogechain',
    shortName: 'DOGE',
    id: ethers.utils.hexlify(2000),
    rpc: 'https://rpc-sg.dogechain.dog',
};
export const CHAIN_OKX: ChainConfig = {
    name: 'OK Exchange',
    shortName: 'OKX',
    id: ethers.utils.hexlify(66),
    rpc: 'https://exchainrpc.okex.org',
};
export const CHAIN_BOBA: ChainConfig = {
    name: 'Boba',
    shortName: 'BOBA',
    id: ethers.utils.hexlify(288),
    rpc: 'https://mainnet.boba.network',
};
export const CHAIN_MOVR: ChainConfig = {
    name: 'Moonriver',
    shortName: 'MOVR',
    id: ethers.utils.hexlify(1285),
    rpc: 'https://rpc.api.moonriver.moonbeam.network',
};
export const CHAIN_GLMR: ChainConfig = {
    name: 'Moonbeam',
    shortName: 'GLMR',
    id: ethers.utils.hexlify(1284),
    rpc: 'https://rpc.api.moonbeam.network',
};
export const CHAIN_ONE: ChainConfig = {
    name: 'Harmony One',
    shortName: 'ONE',
    id: ethers.utils.hexlify(1666600000),
    rpc: 'https://harmony-0-rpc.gateway.pokt.network',
};

const OnboardingButton: React.FC<ButtonProps> = ({ handleNewAccount, handleChainChange, }: ButtonProps) => {
    const [buttonText, setButtonText] = useState(CONNECT_TEXT);
    const [isDisabled, setDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [chain, setChain] = useState('');
    const [accounts, setAccounts] = useState<string[]>([]);
    const onboarding = useRef<MetaMaskOnboarding>();

    useEffect(() => {
        if (!onboarding.current) {
            onboarding.current = new MetaMaskOnboarding();
        }
    }, []);

    useEffect(() => {
        if(isLoading) {
            return;
        }

        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            if (accounts.length > 0) {
                setButtonText(ellipsizeThis(accounts[0], 4, 3));
                setDisabled(true);
                handleNewAccount(accounts[0]);

                if(onboarding.current) {
                    onboarding.current.stopOnboarding();
                }
            } 
            
            else {
                setButtonText(CONNECT_TEXT);
                setDisabled(false);
            }
        }
    }, [accounts, isLoading, handleNewAccount]);

    useEffect(() => {
        handleChainChange(chain);
    }, [handleChainChange, chain]);

    useEffect(() => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            setTimeout(() => {
                if(!window.ethereum || !window.ethereum.isConnected()) {
                    setIsLoading(false);
                    return;
                }
                
                // get connected address
                if(!window.ethereum.selectedAddress) {
                    setDisabled(false);
                    return;
                }

                setChain(window.ethereum.chainId ?? '');
                setAccounts([window.ethereum.selectedAddress]);
                setIsLoading(false);
            }, 100);

            window.ethereum!.on('accountsChanged', (newAccounts) => {
                if(Array.isArray(newAccounts)) {
                    if(typeof(newAccounts[0] === 'string')) {
                        setAccounts(newAccounts);
                    }
                }
            });

            window.ethereum!.on('chainChanged', (hexId) => {
                setChain(hexId as string);
            });

            return () => {
                window.ethereum!.removeListener('accountsChanged', (newAccounts) => setAccounts(newAccounts));
            };
        }

        else {
            setDisabled(false);
            setButtonText(ONBOARD_TEXT);
        }
    }, []);

    const onClick = () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum!
                .request({ method: 'eth_requestAccounts' })
                .then((newAccounts: any) => setAccounts(newAccounts));
        } else {
            if(onboarding.current) {
                onboarding.current.startOnboarding();
            }
        }
    };

    return (
        <button disabled={isDisabled} onClick={onClick}>
            {buttonText}
        </button>
    );
}

export default OnboardingButton;