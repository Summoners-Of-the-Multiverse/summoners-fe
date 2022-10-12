import React, { useState, useEffect } from 'react';
import { runIfFunction } from '../../../common/utils';
import { ChainConfig } from '../ChainConfigs/types';
import { ButtonProps } from './types';
import MetaMaskOnboarding from '@metamask/onboarding';

const requestSwitchChain = async(
    targetChain: ChainConfig,
    onSuccess: () => void,
    onError: (e: any) => void,
) => {
    let {
        id: chainId, 
        name: chainName,
        nativeCurrency,
        rpc
    } = targetChain;
    
    try {
        await window.ethereum!.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }]
        });

        runIfFunction(onSuccess);
    } 
    catch (e: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (e.code === 4902 || e.data?.originalError?.code === 4902) {

            try {
                await window.ethereum!.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainName,
                            chainId,
                            nativeCurrency,
                            rpcUrls: [rpc]
                        }
                    ]
                });
            }

            catch(e) {
                runIfFunction(onError, e);
            }
        }

        else {
            runIfFunction(onError, e);
        }
    }
}

const Switcher: React.FC<ButtonProps> = ({ 
    style, 
    className, 
    children,
    handleChainChange,  
    handleUserRejection,
    handleUnknownError,
    targetChain,
    hide,
    currentChainId,
}: ButtonProps) => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [chain, setChain] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        if(currentChainId !== undefined && currentChainId !== null) {
            setChain(currentChainId);
        }
    }, [currentChainId]);

    useEffect(() => {
        if(chain !== '') {
            //only handle chain change when chain is not empty
            //handle disconnect with connector
            handleChainChange(chain);
        }

        setIsDisabled(chain === targetChain.id);
    }, [handleChainChange, chain, targetChain]);
    
    useEffect(() => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            setTimeout(() => {
                if(!window.ethereum || !window.ethereum.isConnected()) {
                    return;
                }
                
                // get connected address
                if(!window.ethereum.selectedAddress) {
                    return;
                }

                setChain(window.ethereum.chainId ?? '');
            }, 500);
        }
    }, []);

    const onSuccess = () => {
        setChain(chain);
        handleChainChange(chain);
        setIsRequesting(false);
    }

    const onError = (e: any) => {
        if(e.code === 4001) {
            runIfFunction(handleUserRejection);
        }

        else {
            runIfFunction(handleUnknownError);
        }

        setIsRequesting(false);
    }

    const onClick = () => {
        if(isRequesting) {
            return; 
        }

        setIsRequesting(true);

        requestSwitchChain(
            targetChain,
            onSuccess,
            onError,
        );
    };

    if(hide) {
        return null;
    }

    return (
        <button 
            disabled={isDisabled} 
            onClick={onClick} 
            style={style} 
            className={className}
        >
            {children}
        </button>
    );
}

export default Switcher;