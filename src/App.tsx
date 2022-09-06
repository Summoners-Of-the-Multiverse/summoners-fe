import { ethers } from 'ethers';
import React, { useCallback, useState } from 'react';
import './App.scss';
import { requestSwitchChain } from './common/ethUtils';
import MetaMaskConnect, { CHAIN_BSC, CHAIN_POLYGON } from './components/MetaMaskConnect';

const allowedChains =[
    CHAIN_BSC,
    CHAIN_POLYGON,
];

function App() {
    const [address, setAddress] = useState('');
    const [chain, setChain] = useState('');
    const [chainName, setChainName] = useState('');

    const handleNewAccount = useCallback((address: string) => {
        setAddress(address);
    }, []);

    const handleChainChange = useCallback(async (chain: string) => {
        //get allowed chains
        let hexIds: string[] = allowedChains.map(x => x.id);

        if(!hexIds.includes(chain)) {
            //handle unsupported network
            //switch chain default to polygon
            requestSwitchChain(
                CHAIN_BSC.id,
                CHAIN_BSC.name,
                { name: 'BNB', decimals: 18, symbol: 'BNB' },
                [CHAIN_BSC.rpc]
            );
        }

        setChain(chain);
        let chainName = allowedChains.filter(x => x.id === chain)[0]?.shortName ?? '';
        setChainName(chainName.toLowerCase());
    }, []);

    return (
        <div className={`App ${chainName}`}>
            <div>{chain}</div>
            <div>{chainName}</div>
            <MetaMaskConnect
                handleNewAccount={handleNewAccount}
                handleChainChange={handleChainChange}
            />
        </div>
    );
}

export default App;
