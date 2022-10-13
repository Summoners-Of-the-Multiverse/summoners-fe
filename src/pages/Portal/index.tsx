import React, { useCallback, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { AddressContext } from '../../App';
import { EVMSwitcher } from '../../components/EVM';
import { BSC_TEST, POLYGON_TEST, BSC, POLYGON } from '../../components/EVM/ChainConfigs';
import { toast } from 'react-toastify'
import './styles.scss';
import { PortalProps } from './types';
import BackButton from '../../components/BackButton';
const isTestnet = process.env.REACT_APP_CHAIN_ENV === "testnet";
const bscChain = isTestnet ? BSC_TEST : BSC;
const polygonChain = isTestnet ? POLYGON_TEST : POLYGON;

const Portal = ({onChainChange, setAudio}: PortalProps) => {
    const { chain, } = useContext(AddressContext);
    const [currentChain, setCurrentChain] = useState(chain);
	const navigate = useNavigate();

    const handleChainChange = useCallback(async (chain: string) => {
        if(currentChain !== chain) {
            setCurrentChain(chain);
            onChainChange(chain);
        }
    }, [currentChain, onChainChange]);

    const handleUserRejection = () => {
        toast.error('Distracted by Butterflies');
    }

    const handleUnknownError = () => {
        toast.error('Portal Malfunction');
    }

    return (
		<div className='portal-page'>
            <div className="navigate-container">
                <BackButton
                    onButtonClick={() => navigate('/home')}
                />
                <EVMSwitcher
                    targetChain={bscChain}
                    handleChainChange={handleChainChange}
                    handleUserRejection={handleUserRejection}
                    handleUnknownError={handleUnknownError}
                    className={'navigate-button ' + (chain === bscChain.id? 'active' : '')}
                    currentChainId={chain}
                >
                    <span>BSC</span>
                </EVMSwitcher>
                <EVMSwitcher
                    targetChain={polygonChain}
                    handleChainChange={handleChainChange}
                    handleUserRejection={handleUserRejection}
                    handleUnknownError={handleUnknownError}
                    className={'navigate-button ' + (chain === polygonChain.id? 'active' : '')}
                    currentChainId={chain}
                >
                    <span>Polygon</span>
                </EVMSwitcher>
            </div>
		</div>
	)
}

export default Portal;