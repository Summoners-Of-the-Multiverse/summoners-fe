import { AxiosResponse } from 'axios';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { AddressContext } from '../../App';
import instance from '../Axios';
import { MintPromptProps, MonsterBaseMetadata, StarterStatusResponse } from './types';
import './styles.scss';
import { getMonsterImage } from '../../common/utils';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

const mint = async(address: string, metadataId: number) => {
    try {
        await instance.post('/mint', {
            address,
            metadataId
        });

        return true;
    }

    catch {
        return false;
    }
}


const Starter = () => {
    const { address, chain, } = useContext(AddressContext);
    const [hasMinted, setHasMinted] = useState(true);
    const [starterMonsters, setStarterMonsters] = useState<MonsterBaseMetadata[]>([]);
    const navigate = useNavigate();

    //get if address has minted free mon
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
                //always set as true on error
                setHasMinted(true);
            }
        }

        getStarterStatus();
    }, [address]);

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

    const onMint = useCallback(() => {
        navigate('/home');
    }, [navigate]);

    return (
        <div className='starter-page'>
            {
                !hasMinted &&
                <MintPrompt
                    monsters={starterMonsters}
                    onMint={onMint}
                    address={address}
                />
            }
        </div>
    )
}

const MintPrompt = ({ monsters, onMint, address }: MintPromptProps) => {

    const onMintButtonClick = useCallback(async(id: number, name: string) => {
        if(window.confirm(`Mint ${name}?`)) {
            let res = await mint(address, id);
            if(!res) {
                toast.error('Unable to mint!');
                return;
            }

            onMint();
        }
    }, [onMint, address]);

    return (
        <>
            <h1 className='mb-3'>Choose Your Companion</h1>
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

                        return (
                            <div className='starter-monster-card' key={`starter-monster-${index}`}>
                                <div className="monster-info">
                                    <span>{x.element_name}</span>
                                    <span>{x.name}</span>
                                </div>
                                <img src={getMonsterImage(x.img_file)} alt="monster_img"></img>
                                <div className="divider"></div>
                                <div className="stats">
                                    <span><div><span>Atk</span></div>{baseAttack} - {maxAttack}</span>
                                    <span><div><span>Def</span></div>{baseDefense} - {maxDefense}</span>
                                    <span><div><span>Hp</span></div>{baseHp} - {maxHp}</span>
                                    <span><div><span>Crit(%)</span></div>{baseCritChance} - {maxCritChance}</span>
                                    <span><div><span>CritX</span></div>{baseCritMultiplier}x - {maxCritMultiplier}x</span>
                                    <span><div><span>Shiny(%)</span></div>{shinyChance} %</span>
                                </div>
                                <button onClick={() => { onMintButtonClick(x.id, x.name) }}>Mint</button>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Starter;