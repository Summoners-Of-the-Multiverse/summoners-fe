import { AxiosResponse } from 'axios';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { AddressContext } from '../../App';
import instance from '../Axios';
import { MintPromptProps, MonsterBaseMetadata, StarterStatusResponse } from './types';
import './styles.scss';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import MonsterCard from '../../components/MonsterCard';
import ContractCall from '../../components/EVM/ContractCall';
import { truncateStr } from '../../common/utils';
import _ from 'lodash';
import { ChainConfigs } from '../../components/EVM';
import { ChainConfig } from '../../components/EVM/ChainConfigs/types';
import LoadingIndicator from '../../components/Spinner';

const chains = ChainConfigs;

const SuccessMintToast = (chainConfig: ChainConfig|undefined, tx:any) => (
    <div>
        <a target="_blank" rel="noopener noreferrer" href={`${chainConfig?.blockExplorerUrl}/tx/${tx.transactionHash}`}>{truncateStr(tx.transactionHash, 10)}</a> Mint success
    </div>
);

const mint = async(chain: string, address: string, metadataId: number) => {
    try {
        const contract = new ContractCall(chain);
        const mintData: { [ key:string]: any} = await instance.post(`/premint/${chain}`);
        const tx = await contract.mintNft(mintData);

        if (tx.status === 1) {
            const chainConfig: ChainConfig|undefined = _.find(chains, { id: chain,  })

            const tokenId: number = mintData.data.id;
            const tokenHash: number = mintData.data.hash;

            const result: any = await instance.post(`/mint`, {
                address: address,
                metadataId: metadataId,
                tokenId: tokenId,
                tokenHash: tokenHash
            });

            if (result.data.success) {
                toast.success(SuccessMintToast(chainConfig, tx));
                return true;
            }
        }
        return false;
    }
    catch(e) {
        console.log(e);
        return false;
    }
}


const Starter = () => {
    const { address, chain, } = useContext(AddressContext);
    const [hasMinted, setHasMinted] = useState(true);
    const [starterMonsters, setStarterMonsters] = useState<MonsterBaseMetadata[]>([]);
    const [minting, setMinting] = useState(false);

    const navigate = useNavigate();

    const startMinting = () => {
        setMinting(true);
    }

    const endMinting = () => {
        setMinting(false);
    }

    const onMint = useCallback(() => {
        navigate('/home');
    }, [navigate]);

    //get if address has minted free mon
    useEffect(() => {
        const getStarterStatus = async() => {
            try {
                if(!address) {
                    return;
                }
                let res = await instance.get<any, AxiosResponse<StarterStatusResponse>>(`/getStarterStatus/${address}`);
                setHasMinted(res.data.hasMinted);
                if(res.data.hasMinted) {
                    onMint();
                }
            }

            catch {
                //always set as true on error
                setHasMinted(true);
            }
        }

        getStarterStatus();
    }, [address, onMint]);

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

        getStarterMonsters();
    }, [address, chain]);

    return (
        <div className='starter-page'>
            {
                !hasMinted &&
                <MintPrompt
                    monsters={starterMonsters}
                    onMint={onMint}
                    address={address}
                    chain={chain}
                    startMinting={startMinting}
                    endMinting={endMinting}
                />
            }
            <LoadingIndicator
                show={minting}
                type={"pulse"}
                mode={"white"}
                text={"Minting"}
            ></LoadingIndicator>
        </div>
    )
}

const MintPrompt = ({ monsters, onMint, address, chain, startMinting, endMinting }: MintPromptProps) => {

    const onMintButtonClick = useCallback(async(chain:string, id: number, name: string) => {
        if(window.confirm(`Mint ${name}?`)) {
            startMinting();
            let res = await mint(chain, address, id);
            if(!res) {
                toast.error('Unable to mint!');
                endMinting();
                return;
            }

            onMint();
        }
    }, [onMint, address, startMinting, endMinting]);

    return (
        <>
            <h1 className='mb-3'>Choose Your Guardian</h1>
            <div className='starter-monsters-container'>
                {
                    monsters.map((x, index) => {
                        //let baseAttack = x.base_attack.toFixed(0);
                        //let maxAttack = x.max_attack.toFixed(0);
                        //let baseDefense = x.base_defense.toFixed(0);
                        //let maxDefense = x.max_defense.toFixed(0);
                        //let baseHp = x.base_hp.toFixed(0);
                        //let maxHp = x.max_hp.toFixed(0);
                        //let baseCritChance = x.base_crit_chance.toFixed(0);
                        //let maxCritChance = x.max_crit_chance.toFixed(0);
                        //let baseCritMultiplier = x.base_crit_multiplier.toFixed(0);
                        //let maxCritMultiplier = x.max_crit_multiplier.toFixed(0);
                        //let shinyChance = x.shiny_chance.toFixed(0);
                        //let elementId = x.element_id;

                        return (
                            <MonsterCard
                                key={`mob-${x.id}`}
                                imageFile={x.img_file}
                                elementId={x.element_id}
                                attack={x.base_attack}
                                defense={x.base_defense}
                                hp={x.base_hp}
                                crit={x.base_crit_chance}
                                additionalInfo={"test"}
                                isShiny={false}
                            >
                                <button onClick={() => { onMintButtonClick(chain, x.id, x.name) }}>Mint</button>
                            </MonsterCard>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Starter;