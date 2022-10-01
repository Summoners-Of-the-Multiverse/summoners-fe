import React, { useCallback, useEffect, useRef, useState, createContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { EVMConnector, ChainConfigs, EVMSwitcher } from './components/EVM';
import { ellipsizeThis } from './common/utils';
import './App.scss';
import './keyframes.scss';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes, useNavigate } from 'react-router';
import { Battle, BattleEnd, Home, Map, Starter } from './pages';
import { io, Socket } from 'socket.io-client';
import { AddressAreaResponse } from './types';
import instance from './pages/Axios';
import { AxiosResponse } from 'axios';
import { useLocation } from 'react-router';

const { BSC, POLYGON } = ChainConfigs;
const allowedChains =[
    BSC,
    POLYGON,
];

const pagesWithoutHeader = [
    '/map',
    '/battle',
];

export const AddressContext = createContext({
    address: "",
    chain: "",
    areaId: 0,
});

const socket = io('ws://localhost:8081');
export const SocketContext = createContext<Socket>(socket);


function App() {
    const [address, setAddress] = useState('');
    const [showLoader, setShowLoader] = useState(true);
    const [chain, setChain] = useState('');
    const [chainName, setChainName] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [areaId, setAreaId] = useState(0);
    const [shouldRenderHeader, setShouldRenderHeader] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    //mutable chain id cause dont wanna set into infinite loop
    let currentChain = useRef("");

    //first update for mobile or desktop version
    useEffect(() => {
        var width = window.innerWidth;
        var isMobile = width <= 900;

        setIsMobile(isMobile);
    }, []);
    
    //updates it to mobile or desktop version
    const updateWindowDimensions = () => {
        var width = window.innerWidth;
        var isMobile = width <= 900;

        setIsMobile(isMobile);
    }

    window.addEventListener('resize', updateWindowDimensions);

    useEffect(() => {
        if(!address) {
            return;
        }

        const getAddressCurrentArea = async() => {
            if(!address) {
                return;
            }
            
            try {
                let areaRes = await instance.get<any, AxiosResponse<AddressAreaResponse>>(`/area/${address}`);
                setAreaId(areaRes.data.area_id);
            }

            catch {
                setAreaId(0);
                navigate('/starter');
                // toast.error('Unable to get current area');
            }
        }

        getAddressCurrentArea();
    }, [address, navigate]);

    useEffect(() => {
        setShouldRenderHeader(pagesWithoutHeader.includes(location.pathname));
    }, [location]);

    const handleNewAccount = useCallback((address: string) => {
        setAddress(address);
    }, []);

    const handleChainChange = useCallback(async (chain: string) => {
        if(currentChain.current !== chain) {
            currentChain.current = chain;
            setChain(chain);
            let chainName = allowedChains.filter(x => x.id === chain)[0]?.shortName ?? '';
            setChainName(chainName.toLowerCase());
        }
    }, []);

    const onFinishLoading = () => {
        setShowLoader(false);
    }

    const handleUserRejection = () => {
        toast.error('User Rejected');
    }

    const handleUnknownError = () => {
        toast.error('Unknown Error');
    }

    return (
        <div className={`App ${chainName} ${showLoader? 'loading' : ''}`}>
            {/* <video autoPlay muted loop src="/bg.mp4" className="bg"></video> */}

            {/** Connectors */}
            <div className={`${shouldRenderHeader? 'd-none' : 'd-flex'} align-items-center justify-content-center`}>
                <div className='connector-container'>
                    <EVMConnector
                        handleNewAccount={handleNewAccount}
                        handleChainChange={handleChainChange}
                        onFinishLoading={onFinishLoading}
                        className={`metamask-connector ${address? 'logged-in' : ''}`}
                    >
                        <div className={`metamask-btn ${address? 'disabled' : ''}`}>
                            <img src="/metamask-logo.png" alt="metamask-logo"></img>
                        </div>
                        <div className='metamask-text'>
                            <span>{address? ellipsizeThis(address, 9, 9) : 'Your Jouney Starts Here'}</span>
                        </div>
                    </EVMConnector>
            
                    {
                        address &&
                        <div className={`switcher-container ${isMobile? 'mobile' : ''}`}>
                            <EVMSwitcher
                                targetChain={BSC}
                                handleChainChange={handleChainChange}
                                handleUserRejection={handleUserRejection}
                                handleUnknownError={handleUnknownError}
                                className={chain === BSC.id? 'active' : ''}
                                currentChainId={chain}
                            >
                                <>
                                    {
                                        !isMobile &&
                                        <span>Forest</span>
                                    }
                                    {
                                        isMobile &&
                                        <i className='fa fa-tree' style={{ color: 'green' }}></i>
                                    }
                                </>
                            </EVMSwitcher>
                            <EVMSwitcher
                                targetChain={POLYGON}
                                handleChainChange={handleChainChange}
                                handleUserRejection={handleUserRejection}
                                handleUnknownError={handleUnknownError}
                                className={chain === POLYGON.id? 'active' : ''}
                                currentChainId={chain}
                            >
                                <>
                                    {
                                        !isMobile &&
                                        <span>Volcano</span>
                                    }
                                    {
                                        isMobile &&
                                        <i className='fa fa-fire' style={{ color: 'red' }}></i>
                                    }
                                </>
                            </EVMSwitcher>
                        </div>
                    }
                </div>
            </div>
            
            {/** Main Pages */}
            <AddressContext.Provider value={{
                address,
                chain,
                areaId,
            }}>
                <Routes>
                    <Route path="/" element={<Home />}></Route>
                    <Route path="/map" element={<Map onAreaChange={setAreaId}/>}></Route>
                    <Route path="/starter" element={<Starter />}></Route>
                    <Route path="/battle" element={<Battle />}/>
                    <Route path="/battleEnd/:id" element={<BattleEnd />}/>
                </Routes>
            </AddressContext.Provider>
            <ToastContainer 
                position="bottom-left"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={false}
                theme={'colored'}
            />
        </div>
    );
}

export default App;
