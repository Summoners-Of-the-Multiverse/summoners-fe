import { AxiosResponse } from 'axios';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { AddressContext } from '../../App';
import instance from '../Axios';
import { MintPromptProps, MonsterBaseMetadata, StarterPageProps } from './types';
import './styles.scss';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import MonsterCard from '../../components/MonsterCard';
import ContractCall from '../../components/EVM/ContractCall';
import { getElementTooltip } from '../../common/utils';
import _ from 'lodash';
import { ChainConfigs, EVMSwitcher } from '../../components/EVM';
import { ChainConfig } from '../../components/EVM/ChainConfigs/types';
import Spinner from '../../components/Spinner';

const chains = ChainConfigs;
const PREPARING_TEXT = "Preparing Ink";
const CAPTURING_TEXT = "Convincing Guardian";

const { POLYGON_TEST, BSC_TEST } = chains;
const allowedChains = [BSC_TEST.id, POLYGON_TEST.id];

const SuccessMintToast = (chainConfig: ChainConfig|undefined, tx:any) => (
    <div className='link-toast'>
        Guardian Convinced
        <a target="_blank" rel="noopener noreferrer" href={`${chainConfig?.blockExplorerUrl}/tx/${tx.transactionHash}`}>⮕ Their signature ⬅</a> 
    </div>
);

const Starter = ({ onMintCallback, setAudio, onChainChange }: StarterPageProps) => {
    const { address, chain, } = useContext(AddressContext);
    
    const [currentChain, setCurrentChain] = useState(chain);
    const [starterMonsters, setStarterMonsters] = useState<MonsterBaseMetadata[]>([]);
    const [minting, setMinting] = useState(false);
    const [shouldShowSwitcher, setShouldShowSwitcher] = useState(false);
    const [mintText, setMintText] = useState(PREPARING_TEXT);

    const navigate = useNavigate();

    useEffect(() => {
        setAudio('map_world');
    }, [setAudio]);

    const startMinting = () => {
        setMinting(true);
    }

    const endMinting = () => {
        setMinting(false);
    }

    const onMint = useCallback(() => {
        onMintCallback();
        navigate('/home');
    }, [navigate, onMintCallback]);

    useEffect(() => {
        const getStarterMonsters = async() => {
            try {
                if(!address || !chain) {
                    return;
                }
                let res = await instance.get<any, AxiosResponse<MonsterBaseMetadata[]>>(`/getStarterMonsters/${chain}`);
                setStarterMonsters(res.data);
            }

            catch {
                setStarterMonsters([]);
            }
        }

        setShouldShowSwitcher(!allowedChains.includes(chain));
        getStarterMonsters();
    }, [address, chain]);


    const mint = useCallback(async(chain: string, address: string, metadataId: number) => {
        try {
            const contract = new ContractCall(chain);
            const mintData: { [ key:string]: any} = await instance.post(`/premint/${chain}`);

			setMintText(CAPTURING_TEXT);
            const tx = await contract.mintNft(mintData);

            if (tx.status === 1) {
                const chainConfig: ChainConfig|undefined = _.find(chains, { id: chain,  })

                const tokenId: number = mintData.data.id;
                const tokenHash: number = mintData.data.hash;

                const result: any = await instance.post(`/mint`, {
                    address: address,
                    metadataId: metadataId,
                    tokenId: tokenId,
                    tokenHash: tokenHash,
                    chainId: chain
                });

                if (result.data.success) {
                    toast.success(SuccessMintToast(chainConfig, tx));
                    setMintText(PREPARING_TEXT);
                    return true;
                }
            }
            toast.error('Not enough charisma :(');
			setMintText(PREPARING_TEXT);
            return false;
        }
        catch(e: any) {
			if(e.toString().includes('user rejected transaction')) {
                toast.error('Y u staph? :(');
            }
			setMintText(PREPARING_TEXT);
            return false;
        }
    }, []);

    const handleChainChange = useCallback(async (chain: string) => {
        if(currentChain !== chain) {
            setCurrentChain(chain);
            onChainChange(chain);

            setShouldShowSwitcher(!allowedChains.includes(chain));
        }
    }, [currentChain, onChainChange]);

    const handleUserRejection = () => {
        toast.error('You sure?');
    }

    const handleUnknownError = () => {
        toast.error('Portal fluids gone bad');
    }

    return (
        <div className='starter-page'>
            {
                !shouldShowSwitcher &&
                address &&
                <MintPrompt
                    monsters={starterMonsters}
                    onMint={onMint}
                    address={address}
                    chain={chain}
                    startMinting={startMinting}
                    endMinting={endMinting}
                    mint={mint}
                />
            }
            {
                shouldShowSwitcher &&
                address &&
                <>
                    <h1>Choose Your Realm</h1>
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
                </>
            }
            <Spinner
                show={minting}
                type={"pulse"}
                mode={"light"}
                text={mintText}
            ></Spinner>
        </div>
    )
}

const MintPrompt = ({ monsters, onMint, address, chain, startMinting, endMinting, mint }: MintPromptProps) => {

    const onMintButtonClick = useCallback(async(chain:string, id: number, name: string) => {
        if(window.confirm(`Mint ${name}?`)) {
            startMinting();
            let res = await mint(chain, address, id);
            if(!res) {
                endMinting();
                return;
            }

            onMint();
        }
    }, [onMint, address, startMinting, endMinting, mint]);

    return (
        <>
            <h1>Choose Your Guardian</h1>
            <div className='starter-monsters-container'>
                {
                    monsters.map((x, index) => {
                        let baseAttack = x.base_attack.toFixed(0);
                        let maxAttack = x.max_attack.toFixed(0);
                        let baseDefense = x.base_defense.toFixed(0);
                        let maxDefense = x.max_defense.toFixed(0);
                        let baseHp = x.base_hp.toFixed(0);
                        let maxHp = x.max_hp.toFixed(0);
                        let baseCritChance = x.base_crit_chance.toFixed(0);
                        let maxCritChance = x.max_crit_chance.toFixed(0);
                        let baseCritMultiplier = x.base_crit_multiplier.toFixed(0);
                        let maxCritMultiplier = x.max_crit_multiplier.toFixed(0);
                        let shinyChance = x.shiny_chance.toFixed(0);

                        let tooltip = `Attack\t\t${baseAttack} - ${maxAttack}\n`;
                        tooltip += `Defense\t\t${baseDefense} - ${maxDefense}\n`;
                        tooltip += `HP\t\t\t${baseHp} - ${maxHp}\n`;
                        tooltip += `Crit Chance\t${baseCritChance} - ${maxCritChance}\n`;
                        tooltip += `Crit Multiplier\t${baseCritMultiplier}x - ${maxCritMultiplier}x\n`;
                        tooltip += `Shiny Chance\t${shinyChance}%`;
                        tooltip += getElementTooltip(x.element_id);

                        return (
                            <MonsterCard
                                key={`mob-${x.id}`}
                                imageFile={x.img_file}
                                elementId={x.element_id}
                                attack={x.base_attack}
                                defense={x.base_defense}
                                hp={x.base_hp}
                                crit={x.base_crit_chance}
                                additionalInfo={tooltip}
                                isShiny={false}

                                showMintButton={true}
                                mintButtonText={'Choose'}
                                onMintButtonClick={() => onMintButtonClick(chain, x.id, x.name)}
                                disableMintButton={false}
                            >
                                <div className='mobile-divider'></div>
                            </MonsterCard>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Starter;