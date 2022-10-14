import React, { useCallback, useEffect, useRef, useState, createContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { EVMConnector, ChainConfigs, EVMSwitcher } from './components/EVM';
import { ellipsizeThis, getBg, getWsUrl } from './common/utils';
import './App.scss';
import './keyframes.scss';
import './fog.scss';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes, useNavigate } from 'react-router';
import { Battle, BattleResult, BattleHistory, Home, Inventory, Map, Portal, Starter, Intermediate } from './pages';
import { io, Socket } from 'socket.io-client';
import { AddressAreaResponse, StarterStatusResponse } from './types';
import instance from './pages/Axios';
import { AxiosResponse } from 'axios';
import { useCurrentPath } from './hooks/useCurrentPath';
import { Button } from 'react-bootstrap';
const { BSC_TEST, POLYGON_TEST, BSC, POLYGON } = ChainConfigs;
const isTestnet = process.env.REACT_APP_CHAIN_ENV === "testnet";

// assign chain info based on env
const BscChain = isTestnet ? BSC_TEST : BSC;
const PolygonChain = isTestnet ? POLYGON_TEST : POLYGON;

const allowedChains = isTestnet ? [
    BSC_TEST,
    POLYGON_TEST
] : [
    BSC,
    POLYGON
];

const pagesWithHeader = [
    '/home',
];

const pagesWithoutMask: string[] = [];

const pagesWithBlur = [
    '/portal',
    '/battle',
    '/inventory',
    '/battleHistory',
    '/battleResult/:id',
    '/battleResult/:id/:returnToPage',
];

export const AddressContext = createContext({
    address: "",
    chain: "",
    chainName: "",
    areaId: 0,
});

const socket = io(getWsUrl());
export const SocketContext = createContext<Socket>(socket);

// for useCurrentPath
const routes = [
    { path: '/' },
    { path: '/portal' },
    { path: '/map' },
    { path: '/starter' },
    { path: '/battle' },
    { path: '/battleResult/:id' },
    { path: '/battleResult/:id/:returnToPage' },
    { path: '/battleHistory' },
    { path: '/inventory' },
    { path: '/home' },
];

function App() {
    const [address, setAddress] = useState('');
    const [showLoader, setShowLoader] = useState(true);

    //after animation
    const [shouldRemoveLoader, setShouldRemoveLoader] = useState(false);

    const [chain, setChain] = useState('');
    const [chainName, setChainName] = useState('');
    // const [isMobile, setIsMobile] = useState(false);
    const [areaId, setAreaId] = useState(0);
    const [shouldRenderHeader, setShouldRenderHeader] = useState(true);
    const [shouldMask, setShouldMask] = useState(false);
    const [shouldBlur, setShouldBlur] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMinted, setHasMinted] = useState(true);

    //when switcher appears, bg is blurred and masked
    //header will be hidden too
    const [shouldShowSwitcher, setShouldShowSwitcher] = useState(false);
    const [audio, setAudio] = useState("");

    const audioPlayer = useRef(new Audio());
    const navigate = useNavigate();
    const currentPath = useCurrentPath(routes);

    //mutable chain id cause dont wanna set into infinite loop
    let currentChain = useRef("");

    //updates it to mobile or desktop version
    /* const updateWindowDimensions = () => {
        var width = window.innerWidth;
        var isMobile = width <= 900;

        setIsMobile(isMobile);
    }

    //first update for mobile or desktop version
    useEffect(() => {
        var width = window.innerWidth;
        var isMobile = width <= 900;

        setIsMobile(isMobile);
        window.addEventListener('resize', updateWindowDimensions);
    }, []); */


    // get if address has minted free mon
    useEffect(() => {
        const getStarterStatus = async() => {
            try {
                if(!address) {
                    return;
                }
                let res = await instance.get<any, AxiosResponse<StarterStatusResponse>>(`/getStarterStatus/${address}`);
                setHasMinted(res.data.hasMinted);
            }

            catch {
                //always set as false on error
                setHasMinted(false);
            }
        }

        getStarterStatus();
    }, [address]);

    // get address area
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
                // toast.error('Unable to get current area');
            }
        }

        getAddressCurrentArea();
    }, [address]);

    useEffect(() => {
        if(isLoading) {
            return;
        }

        if(!currentPath) {
            // no random pages
            navigate('/');
            return;
        }

        //if not logged in and not intermediate
        if(currentPath !== "/" && !address) {
            navigate('/starter');
            setShouldRenderHeader(true);
            setShouldMask(true);
            setShouldBlur(true);
            return;
        }

        //if not intermediate and if not minted
        if(!hasMinted && currentPath !== "/" && currentPath !== "/starter" /** prevent endless loop */) {
            navigate('/starter');
            setShouldRenderHeader(true);
            setShouldMask(true);
            setShouldBlur(true);
            // need the connect button
            return;
        }

        //redirect to home if page is starter and has minted
        if (hasMinted && currentPath === "/starter") {
            navigate('/home');
            setShouldRenderHeader(false);
            // need the connect button
            return;
        }

        //if has minted and current path is starter and is connected
        if (currentPath === "/starter") {
            // need the connect button
            setShouldRenderHeader(!address);
        }

        else {
            //default process render header
            setShouldRenderHeader(pagesWithHeader.includes(currentPath));
        }

        setShouldMask(!pagesWithoutMask.includes(currentPath));
        setShouldBlur(pagesWithBlur.includes(currentPath));
        setShouldShowSwitcher(currentPath !== '/' && !allowedChains.map(x => x.id).includes(chain));
    }, [currentPath, navigate, areaId, address, isLoading, hasMinted, chain]);

    //controls audio
    useEffect(() => {
        audioPlayer.current.pause();
        audioPlayer.current = new Audio('/assets/sounds/' + audio + ".mp3");
        audioPlayer.current.play();
        audioPlayer.current.loop = true;
    }, [audio]);

    const handleNewAccount = useCallback((address: string) => {
        setIsLoading(false);
        setAddress(address);

        if(address === "") {
            setAreaId(0);
        }
    }, []);

    const handleChainChange = useCallback(async (chain: string) => {
        if(currentChain.current !== chain) {
            currentChain.current = chain;
            setChain(chain);
            let chainName = allowedChains.filter(x => x.id === chain)[0]?.shortName ?? '';
            setChainName(chainName.toLowerCase());
            setShouldShowSwitcher(
                currentPath !== '/'
                && !allowedChains.map(x => x.id).includes(chain)
                && !!address // must be logged in
            );
        }
    }, [currentPath, address]);

    const onFinishLoading = () => {
        setShowLoader(false);

        setTimeout(() => {
            setShouldRemoveLoader(true);
        }, 750);
    }

    const onMintCallback = () => {
        setAreaId(1);
        setHasMinted(true);
    }

    const handleUserRejection = () => {
        toast.error('You sure?');
    }

    const handleUnknownError = () => {
        toast.error('Portal fluids gone bad');
    }

    if (!window.ethereum) {
        return (
            <div className="metamask-404">
                <img src="/assets/metamask404.png" />
                <Button onClick={() => {
                    window.location.href = `https://metamask.io/download/`
                }}>Get Metamask</Button>
            </div>
        )
    }

    return (
        <div className={`App ${chainName} ${showLoader? 'loading' : ''}`}>
            {
                !shouldRemoveLoader &&
                <div className="spinner-container"></div>
            }

            <div className={`${currentPath === "/"? 'd-none' : ''} bg-container`}>
                {
                    ((!isLoading && areaId !== 0) || currentPath === "/starter") &&
                    <>
                    <img className='bg' src={getBg(areaId, shouldBlur || shouldShowSwitcher)} alt="background_image" />

                    {/** mask only when address is present cause it'll be the login page then */}
                    <div className={`mask ${shouldMask || shouldShowSwitcher? '' : 'd-none'}`}></div>
                    </>
                }
            </div>

            {/** Connectors */}
            <div className={`${!shouldRenderHeader || shouldShowSwitcher? 'd-none' : 'd-flex'} header-container ${address? '' : 'disconnected'}`}>
                <div className={`connector-container`}>
                    <EVMConnector
                        handleNewAccount={handleNewAccount}
                        handleChainChange={handleChainChange}
                        onFinishLoading={onFinishLoading}
                        className={`${isLoading? 'loading' : ''} metamask-connector ${address? 'logged-in' : ''}`}
                    >
                        <div className={`metamask-btn ${address? 'disabled' : ''}`}>
                            <img src="/logo192.png" alt="metamask-logo"></img>
                        </div>
                        <div className='metamask-text'>
                            <span>{address? ellipsizeThis(address, 9, 9) : 'Your Journey Starts Here'}</span>
                        </div>
                    </EVMConnector>

                    {/* <h1 className={`logo-text ${address? 'd-block' : 'd-none'}`}>Summoners of the Multiverse</h1> */}
                    <img src="/summoner.png" alt="logo" className={`logo ${address? 'd-block' : 'd-none'}`}/>
                    <span className={`logo-text ${address? 'd-block' : 'd-none'}`}>Summoner: {ellipsizeThis(address, 5, 5)}</span>
                </div>
            </div>

            {
                shouldShowSwitcher &&
                address &&
                <div className='realm-chooser-container'>
                    <h1>Choose Your Realm</h1>
                    <EVMSwitcher
                        targetChain={BscChain}
                        handleChainChange={handleChainChange}
                        handleUserRejection={handleUserRejection}
                        handleUnknownError={handleUnknownError}
                        className={'navigate-button ' + (chain === BscChain.id? 'active' : '')}
                        currentChainId={chain}
                    >
                        <span>BSC</span>
                    </EVMSwitcher>
                    <EVMSwitcher
                        targetChain={PolygonChain}
                        handleChainChange={handleChainChange}
                        handleUserRejection={handleUserRejection}
                        handleUnknownError={handleUnknownError}
                        className={'navigate-button ' + (chain === PolygonChain.id? 'active' : '')}
                        currentChainId={chain}
                    >
                        <span>Polygon</span>
                    </EVMSwitcher>
                </div>
            }


            {/** Main Pages */}
            {
                !shouldShowSwitcher &&
                <AddressContext.Provider value={{
                    address,
                    chain,
                    areaId,
                    chainName,
                }}>
                    {/** Please update routes constant if there's a new page */}
                    <Routes>
                        <Route path="/home" element={<Home setAudio={audio => setAudio(audio)}/>}></Route>
                        <Route path="/map" element={<Map setAudio={audio => setAudio(audio)} onAreaChange={setAreaId}/>}></Route>
                        <Route path="/portal" element={<Portal setAudio={audio => setAudio(audio)} onChainChange={handleChainChange}/>}></Route>
                        <Route path="/starter" element={<Starter setAudio={audio => setAudio(audio)} onMintCallback={onMintCallback} onChainChange={handleChainChange}/>}></Route>
                        <Route path="/inventory" element={<Inventory setAudio={audio => setAudio(audio)} />}></Route>
                        <Route path="/home" element={<Home setAudio={audio => setAudio(audio)} />}></Route>
                        <Route path="/battle" element={<Battle setAudio={audio => setAudio(audio)} />}/>
                        <Route path="/battleResult/:id" element={<BattleResult setAudio={audio => setAudio(audio)} />}/>
                        <Route path="/battleResult/:id/:returnToPage" element={<BattleResult setAudio={audio => setAudio(audio)} />}/>
                        <Route path="/battleHistory" element={<BattleHistory setAudio={audio => setAudio(audio)} />}/>
                        <Route path="/" element={<Intermediate />}/>
                    </Routes>
                </AddressContext.Provider>
            }

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
