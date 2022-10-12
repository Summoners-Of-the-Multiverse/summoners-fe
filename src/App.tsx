import React, { useCallback, useEffect, useRef, useState, createContext } from 'react';
import { ToastContainer } from 'react-toastify';
import { EVMConnector, ChainConfigs } from './components/EVM';
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
const { BSC_TEST, POLYGON_TEST } = ChainConfigs;

const allowedChains =[
    BSC_TEST,
    POLYGON_TEST,
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
        if(!currentPath) {
            // no random pages
            navigate('/');
            return;
        }

        //if not logged in and not intermediate
        if(currentPath !== "/" && !address) {
            // no random pages
            navigate('/starter');
            setShouldRenderHeader(true);
            return;
        }

        //if not intermediate and if not minted
        if(!hasMinted && currentPath !== "/" && currentPath !== "/starter" /** prevent endless loop */) {
            navigate('/starter');
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
    }, [currentPath, navigate, areaId, address, isLoading, hasMinted]);

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
        }
    }, []);

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
                    <img className='bg' src={getBg(areaId, shouldBlur)} alt="background_image" />
                    
                    {/** mask only when address is present cause it'll be the login page then */}
                    <div className={`mask ${shouldMask? '' : 'd-none'}`}></div>
                    </>
                }
            </div>

            {/** Connectors */}
            <div className={`${!shouldRenderHeader? 'd-none' : 'd-flex'} header-container ${address? '' : 'disconnected'}`}>
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
            {/** Main Pages */}
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
