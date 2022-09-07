import React, { useState, useEffect } from 'react';
import { runIfFunction } from '../../../common/utils';
import { ChainConfig } from '../ChainConfigs/types';
import { ButtonProps } from './types';

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
        if (e.code === 4902) {

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
    handleChainChange,  
    targetChain,
    hide,
    disabled,
    text,
}: ButtonProps) => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [chain, setChain] = useState('');

    useEffect(() => {
        handleChainChange(chain);
    }, [handleChainChange, chain]);

    const onSuccess = () => {
        setChain(chain);
        handleChainChange(chain);

        setIsRequesting(false);
    }

    const onError = (e: any) => {
        if(e.code === 4001) {
            alert(`Please manually add ${targetChain.name} to your MetaMask.`)
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
            disabled={disabled} 
            onClick={onClick} 
            style={style} 
            className={className}
        >
            {text ?? `Connect to ${targetChain.name}`}
        </button>
    );
}

export default Switcher;