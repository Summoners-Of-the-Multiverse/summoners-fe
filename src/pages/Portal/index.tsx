import React, { useCallback, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { AddressContext } from '../../App';
import { EVMSwitcher } from '../../components/EVM';
import { BSC_TEST, POLYGON_TEST } from '../../components/EVM/ChainConfigs';
import { toast } from 'react-toastify'
import './styles.scss';
import { PortalProps } from './types';

const Portal = ({onChainChange}: PortalProps) => {
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
        toast.error('User Rejected');
    }

    const handleUnknownError = () => {
        toast.error('Unknown Error');
    }

    return (
		<div className='portal-page'>

			<button 
				className='back-button'
				onClick={() => navigate('/')}
			>
				<i className="fa fa-chevron-left"></i>
                <span>Back</span>
			</button>
            <EVMSwitcher
                targetChain={BSC_TEST}
                handleChainChange={handleChainChange}
                handleUserRejection={handleUserRejection}
                handleUnknownError={handleUnknownError}
                className={'navigate-button ' + (chain === BSC_TEST.id? 'active' : '')}
                currentChainId={chain}
            >
                <span>BSC</span>
            </EVMSwitcher>
            <EVMSwitcher
                targetChain={POLYGON_TEST}
                handleChainChange={handleChainChange}
                handleUserRejection={handleUserRejection}
                handleUnknownError={handleUnknownError}
                className={'navigate-button ' + (chain === POLYGON_TEST.id? 'active' : '')}
                currentChainId={chain}
            >
                <span>Polygon</span>
            </EVMSwitcher>
		</div>
	)
}

export default Portal;