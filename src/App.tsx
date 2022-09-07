import { ethers } from 'ethers';
import React, { useCallback, useState } from 'react';
import './App.scss';
import { EVMConnector, ChainConfigs, EVMSwitcher } from './components/EVM';

const { BSC, POLYGON } = ChainConfigs;
const allowedChains =[
    BSC,
    POLYGON,
];
const allowedIds: string[] = allowedChains.map(x => ethers.utils.hexlify(x.id));

function App() {
    const [address, setAddress] = useState('');
    const [showSwitcher, setShowSwitcher] = useState(true);
    const [showLoader, setShowLoader] = useState(true);
    const [chain, setChain] = useState('');
    const [chainName, setChainName] = useState('');

    const handleNewAccount = useCallback((address: string) => {
        setAddress(address);
    }, []);

    const handleChainChange = useCallback(async (chain: string) => {
        if(!allowedIds.includes(chain)) {
            //handle unsupported network
            setShowSwitcher(true);
        }

        else {
            setShowSwitcher(false);
        }

        setChain(chain);
        let chainName = allowedChains.filter(x => x.id === chain)[0]?.shortName ?? '';
        setChainName(chainName.toLowerCase());
    }, []);

    const onFinishLoading = () => {
        console.log('here')
        setShowLoader(false);
    }

    return (
        <div className={`App ${chainName} ${showLoader? 'loading' : ''}`}>
            <div>{chain}</div>
            <div>{chainName}</div>
            <EVMConnector
                handleNewAccount={handleNewAccount}
                handleChainChange={handleChainChange}
                onFinishLoading={onFinishLoading}
            />
            <EVMSwitcher
                hide={!showSwitcher}
                targetChain={BSC}
                handleChainChange={handleChainChange}
            />
            <EVMSwitcher
                hide={!showSwitcher}
                targetChain={POLYGON}
                handleChainChange={handleChainChange}
            />

            {
                showLoader &&
                <div className='loader'>
                    <i className='fa fa-spinner fa-spin fa-4x'></i>
                </div>
            }
        </div>
    );
}

export default App;
