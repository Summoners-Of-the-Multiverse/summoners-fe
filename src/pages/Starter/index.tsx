import { AxiosResponse } from 'axios';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { AddressContext } from '../../App';
import instance from '../Axios';
import { MintPromptProps, MonsterBaseMetadata, StarterStatusResponse } from './types';
import './styles.scss';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import MonsterCard from '../../components/MonsterCard';

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
                                imageFile={x.img_file}
                                elementId={x.element_id}
                                attack={x.base_attack}
                                defense={x.base_defense}
                                hp={x.base_hp}
                                crit={x.base_crit_chance}
                                additionalInfo={"test"}
                            >
                                <button onClick={() => { onMintButtonClick(x.id, x.name) }}>Mint</button>
                            </MonsterCard>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Starter;