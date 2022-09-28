import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './styles.scss'
import { Socket } from 'socket.io-client';
import { AddressContext, SocketContext } from '../../App';
import { cloneObj, getEffect, getMonsterBattleImage, getMonsterIcon, getRandomNumber, getRandomNumberAsString } from '../../common/utils';
import { StartBattleParams, BattleDetails, BattlePageProps, EncounterEffectProps, EncounterImageProps, MonsterEquippedSkillById, PlayerHpBarProps, PlayerMonsterBarProps, EncounterHit, EncounterDamageReceived, SkillUsage, PlayerSkillBarProps, MonsterSkill, Attack, ListenBattleParams, MonsterStats } from './types';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { ELEMENT_CHAOS, ELEMENT_FIRE, ELEMENT_GRASS, ELEMENT_WATER } from '../../common/constants';

let playerMonsterSkills: {[id: string]: MonsterEquippedSkillById } = {};
const AUTO_BATTLE = false;

const startBattle = ({
    socket,
    isInBattle,
    address,
    chainId,
}: StartBattleParams ) => {
    if(isInBattle) {
        return;
    }
    
    console.log('starting battle')
    if(address) {
        socket.emit('start_battle', {address, chainId});
    }
} 

const listenToBattle = ({
    socket,
    address,
    onLoad,
    onEncounterReceivedDamage,
    onDamageReceived,
    onMonsterOffCd,
    onEndSkillsReceived,
    onBattleEnd,
}: ListenBattleParams ) => {
    
    socket.on('invalid_battle', () => { onBattleEnd(false, true) });
    socket.on('battle_start', (battleDetails: BattleDetails) => {
        onLoad(battleDetails);
        playerMonsterSkills = battleDetails.playerMonsterSkills;

        if(AUTO_BATTLE) {
            console.log('emitting attack');
            Object.keys(playerMonsterSkills).forEach(id => {
                let skillIds = Object.keys(playerMonsterSkills[id]);
                let skillIndex = getRandomNumber(0, 3, true);
                let skillId = skillIds[skillIndex];
                attack(socket, address, parseInt(id), parseInt(skillId));
            });
        }
    })

    socket.on('encounter_hit', ({ damage, playerHpLeft }: EncounterHit) => {
        onDamageReceived({damage, playerHpLeft});
    });

    socket.on('player_monster_off_cd', (monsterId: number) => {
        onMonsterOffCd(monsterId);

        if(AUTO_BATTLE) {
            console.log('emitting attack');
            Object.keys(playerMonsterSkills).forEach(id => {
                let skillIds = Object.keys(playerMonsterSkills[id]);
                let skillIndex = getRandomNumber(0, 3, true);
                let skillId = skillIds[skillIndex];
                attack(socket, address, parseInt(id), parseInt(skillId));
            });
        }
    });
    socket.on('encounter_damage_received', (dmg: EncounterDamageReceived) => {
        onEncounterReceivedDamage(dmg);
    });
    socket.on('end_battle_skill_usage', (usage: SkillUsage) => {
        onEndSkillsReceived(usage);
    });

    socket.on('battle_lost', () => {
        onBattleEnd(false);
        console.log('Battle Lost')
    });

    socket.on('battle_won', () => {
        onBattleEnd(true);
        console.log('Battle Won')
    });

    return () => {
        socket.off('invalid_battle');
        socket.off('battle_start');
        socket.off('encounter_hit');
        socket.off('player_monster_off_cd');
        socket.off('encounter_damage_received');
        socket.off('end_battle_skill_usage');
        socket.off('battle_lost');
        socket.off('battle_won');
    };
}

const attack = (socket: Socket, address: string, monsterId: number, skillId: number) => {
    socket.emit(`battle_${address}`, {
        type: "player_attack",
        value: {
            id: monsterId,
            skill_id: skillId,
        }
    });
}

const Battle = () => {
    const socket = useContext(SocketContext);
    const { address, chain, } = useContext(AddressContext);
    const [ battleDetails, setBattleDetails ] = useState<BattleDetails | undefined>(undefined);
    const [ isInBattle, setIsInBattle ] = useState(false);
    const [ playerCurrentHp, setPlayerCurrentHp ] = useState(-1);
    const [ encounterCurrentHp, setEncounterCurrentHp ] = useState(-1);
    const [ monsterIdOffCd, setMonsterIdOffCd ] = useState<string | undefined>(undefined);
    const [ encounterDamageReceived, setEncounterDamageReceived ] = useState<EncounterDamageReceived | undefined>(undefined);
    const navigate = useNavigate();

    const onLoad = (battleDetails: BattleDetails) => {
        setEncounterCurrentHp(-1);
        setPlayerCurrentHp(-1);
        setBattleDetails(battleDetails);
    }

    const onBattleEnd = useCallback((hasWon: boolean, isInvalid: boolean = false) => {
        //3s timer
        if(hasWon) {
            setEncounterCurrentHp(0);
        }

        else {
            setPlayerCurrentHp(0);
        }

        if(isInvalid) {
            toast.error('There is currently an ongoing battle!');
            setIsInBattle(false);
            return;
        }

        setEncounterDamageReceived(undefined);
        
        toast.info('Redirecting to battle stats in 3 seconds', {
            autoClose: 2000
        });
        setTimeout(() => {
            setIsInBattle(false);
            //navigate('/battleEnd');
        }, 3000);
    }, [navigate]);

    const onEncounterReceivedDamage = useCallback(({attacks, encounterHpLeft, monsterId, skillId}: EncounterDamageReceived) => {
        setEncounterCurrentHp(encounterHpLeft);
        setEncounterDamageReceived({attacks, encounterHpLeft, monsterId, skillId});
    }, []);

    const onDamageReceived = useCallback(({ damage, playerHpLeft }: EncounterHit) => {
        setPlayerCurrentHp(playerHpLeft);
    }, []);

    const onMonsterOffCd = useCallback((monsterId: number) => {
        setMonsterIdOffCd(monsterId.toString());

        setTimeout(() => {
            setMonsterIdOffCd(undefined);
        }, 10);
    }, []);

    const onEndSkillsReceived = () => {

    }

    //constantly listen to events
    useEffect(() => {
        return listenToBattle({
            socket,
            address,
            onLoad,
            onBattleEnd,
            onDamageReceived,
            onEncounterReceivedDamage,
            onEndSkillsReceived,
            onMonsterOffCd
        });
    }, [socket, address, onBattleEnd, onDamageReceived, onEncounterReceivedDamage, onMonsterOffCd]);

    const handleStartBattle = useCallback(() => {
        setIsInBattle(true);
        return startBattle({
            socket, 
            isInBattle, 
            address, 
            chainId: chain, 
        });
    }, [socket, isInBattle, address, chain]);

    return (
        <div className='battle-page'>
            <div className='d-flex flex-column'>
                {
                    !isInBattle &&
                    address &&
                    chain &&
                    <button 
                        className='btn btn-sm btn-success'
                        onClick={handleStartBattle}
                    >
                        Start Battle
                    </button>
                }

                {
                    isInBattle &&
                    <BattlePage 
                        socket={socket}
                        address={address}
                        details={battleDetails}
                        playerCurrentHp={playerCurrentHp}
                        encounterCurrentHp={encounterCurrentHp}
                        monsterIdOffCd={monsterIdOffCd}
                        encounterDamageReceived={encounterDamageReceived}
                    />
                }
            </div>
        </div>
    )
}

const BattlePage = ({socket, address, details, playerCurrentHp, encounterCurrentHp, monsterIdOffCd, encounterDamageReceived}: BattlePageProps) => {
    const [activeMonsterId, setActiveMonsterId] = useState<string>("");
    const [monstersOnCd, setMonstersOnCd] = useState<string[]>([]);

    let previousMonstersOnCd = useRef<string[]>([]);
    let monsterCount = useRef(0);

    //init
    let playerMaxHp = useMemo(() => {
        if(!details) {
            return 0;
        }
        return Object.values(details.playerMonsters).map(x => x.hp).reduce((a,b) => a+b);
    }, [details]);

    let monsterMaxHp = useMemo(() => {
        if(!details) {
            return 0;
        }
        return details.encounter.hp;
    }, [details]);

    //set on / off cd
    useEffect(() => {
        let cloned = cloneObj<string[]>(previousMonstersOnCd.current).filter(x => x !== monsterIdOffCd);
        setMonstersOnCd(cloned);
    }, [monsterIdOffCd, details]);


    //register current monsters on cd
    useEffect(() => {
        previousMonstersOnCd.current = cloneObj<string[]>(monstersOnCd);

        console.log(monstersOnCd)
        console.log(monstersOnCd.length, monsterCount.current)

        // there are other active monsters
        if(monstersOnCd.length <= (monsterCount.current - 1) && details && monstersOnCd.includes(activeMonsterId)) {
            let nextActiveId = Object.keys(details.playerMonsters).filter(x => !monstersOnCd.includes(x))[0];
            setActiveMonsterId(nextActiveId);
        }
    }, [monstersOnCd, activeMonsterId, details]);

    const onSkillClick = useCallback((monsterId: string) => {
        if(monstersOnCd.includes(monsterId)) {
            return;
        }

        let cloned = cloneObj<string[]>(monstersOnCd);
        cloned.push(monsterId);
        setMonstersOnCd(cloned);

        // there are other active monsters
        if(cloned.length < monsterCount.current && details) {
            let nextActiveId = Object.keys(details!.playerMonsters).filter(x => !cloned.includes(x))[0];
            console.log({nextActiveId});
            setActiveMonsterId(nextActiveId);
        }
    }, [monstersOnCd, details]);

    // add hotkeys
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if(!details) {
                return;
            }

            let { playerMonsterSkills } = details;
            let nonEmptyActiveMonsterId = activeMonsterId === ""? Object.keys(playerMonsterSkills)[0] : activeMonsterId;

            const getSkillId = (index: number) => {
                return parseInt(Object.keys(playerMonsterSkills[nonEmptyActiveMonsterId])[index]);
            }

            const getMonsterId = (index: number) => {
                let { playerMonsterSkills } = details;
                return Object.keys(playerMonsterSkills)[index];
            }

            switch(e.key) {
                case "ArrowUp":
                    attack(socket, address, parseInt(nonEmptyActiveMonsterId), getSkillId(0));
                    onSkillClick(nonEmptyActiveMonsterId);
                    break;
                case "ArrowRight":
                    attack(socket, address, parseInt(nonEmptyActiveMonsterId), getSkillId(1));
                    onSkillClick(nonEmptyActiveMonsterId);
                    break;
                case "ArrowLeft":
                    attack(socket, address, parseInt(nonEmptyActiveMonsterId), getSkillId(2));
                    onSkillClick(nonEmptyActiveMonsterId);
                    break;
                case "ArrowDown":
                    attack(socket, address, parseInt(nonEmptyActiveMonsterId), getSkillId(3));
                    onSkillClick(nonEmptyActiveMonsterId);
                    break;
                case "1":
                    setActiveMonsterId(getMonsterId(0));
                    break;
                case "2":
                    setActiveMonsterId(getMonsterId(1));
                    break;
                case "3":
                    setActiveMonsterId(getMonsterId(2));
                    break;
                case "4":
                    setActiveMonsterId(getMonsterId(3));
                    break;
                default:
                    break;
            }
        }

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, [activeMonsterId, details, socket, address, onSkillClick]);

    useEffect(() => {
        if(!details) {
            return;
        }

        monsterCount.current = Object.keys(details.playerMonsters).length;
    }, [details]);

    if(!details) {
        return null;
    }

    let { playerMonsters, playerMonsterSkills, encounter } = details;
    let nonNullActiveMonsterId = activeMonsterId ?? Object.keys(playerMonsterSkills)[0];

    return (
        <div className="battle-container">
            <EncounterImage 
                encounter={encounter}
                encounterDamageReceived={encounterDamageReceived}
                playerMonsterSkills={playerMonsterSkills}
            />
            <EncounterHpBar
                currentHp={encounterCurrentHp === -1? monsterMaxHp : encounterCurrentHp}
                maxHp={monsterMaxHp}
            />
            <PlayerHpBar
                currentHp={playerCurrentHp === -1? playerMaxHp : playerCurrentHp}
                maxHp={playerMaxHp}
            />
            <PlayerMonsterBar
                playerMonsters={playerMonsters}
                onPlayerMonsterClick={(monsterId)=> {setActiveMonsterId(monsterId)}}
                monstersOnCd={monstersOnCd}
                activeMonsterId={nonNullActiveMonsterId}
            />
            {/* <PlayerSkillBar
                socket={socket}
                address={address}
                playerMonsterSkills={playerMonsterSkills}
                activeMonsterId={nonNullActiveMonsterId}
                onSkillClick={onSkillClick}
                isOnCd={monstersOnCd.includes(activeMonsterId)}
            /> */}
        </div>
    );
}

const EncounterImage = ({ encounter, encounterDamageReceived, playerMonsterSkills }: EncounterImageProps) => {
    const [currentEffects, setCurrentEffects] = useState<string[]>([]);
    const effects = useRef<string[]>([]);

    useEffect(() => {
        if(!encounterDamageReceived) {
            return;
        }

        let { skillId, monsterId } = encounterDamageReceived;

        if(!playerMonsterSkills[encounterDamageReceived.monsterId]) {
            return;
        }
        if(!playerMonsterSkills[monsterId][skillId]) {
            return;
        }

        effects.current.push(playerMonsterSkills[monsterId][skillId].effect_file);
        setCurrentEffects(cloneObj(effects.current));

        setTimeout(() => {
            effects.current.pop();
            setCurrentEffects(cloneObj(effects.current));
        }, 800);
    }, [encounterDamageReceived, playerMonsterSkills]);

    return (
        <div className='encounter-img-container'>
            <span>{encounter.name}{encounter.is_shiny? '*' : ''}</span>
            <img className='encounter-img' src={getMonsterBattleImage(encounter.img_file)} alt="encounter_img"></img>
            {
                Object.entries(playerMonsterSkills).map(([monsterId, skills], index) => (
                    <EncounterDamagedNumbers
                        encounterDamageReceived={encounterDamageReceived}
                        skills={skills}
                        monsterId={monsterId}
                        attackIndex={index}
                        key={`damage-numbers-${index}`}
                    />
                ))
            }

            {
                currentEffects.map((x, index) => (
                    <div className='effect-container' key={`effect-${x}-${index}`}>
                        <img src={getEffect(x)} alt="effect"></img>
                    </div>
                ))
            }
        </div>
    );
}

const EncounterDamagedNumbers = ({ encounterDamageReceived, skills, attackIndex, monsterId }: EncounterEffectProps) => {
    const [attacks, setAttacks] = useState<Attack[]>([]);
    const [randomLocations, setRandomLocations] = useState([["0%", "0%"]]);

    useEffect(() => {
        //no damage dont do anything
        if(!encounterDamageReceived) {
            return;
        }

        //not current monster
        if(encounterDamageReceived.monsterId.toString() !== monsterId) {
            return;
        }

        //no skill
        if(!skills[encounterDamageReceived.skillId.toString()]) {
            return;
        }

        setAttacks([]);

        let newLocations: string[][] = [];

        for(var i = 0; i < encounterDamageReceived.attacks.length; i++) {
            let randomBottom = getRandomNumberAsString(0, 50) + "%";
            let randomLeft = getRandomNumberAsString(30, 60) + "%";
            newLocations.push([randomBottom, randomLeft]);
        }

        // setRandomBottom(randomBottom);
        // setRandomLeft(randomLeft);

        setRandomLocations(newLocations);

        setTimeout(() => {
            setAttacks(encounterDamageReceived.attacks);
        }, 10);

    }, [encounterDamageReceived, skills, monsterId]);

    return (
        <div className={`attacks`}>
            {
                attacks.map((x, index) => {
                    let damage = x.damage.toFixed(0);
                    let [bottom, left] = randomLocations[index];

                    let element = "";

                    switch(x.element_id) {
                        case ELEMENT_GRASS:
                            element = "grass";
                            break;
                        case ELEMENT_FIRE:
                            element = "fire";
                            break;
                        case ELEMENT_WATER:
                            element = "water";
                            break;
                        case ELEMENT_CHAOS:
                            element = "chaos";
                            break;
                        default:
                            element = "chaos";
                            break;
                    }

                    let attackDiv = null;

                    switch(x.type) {
                        case "immune":
                            attackDiv = <div className={`attack immune ${element}`} style={{ bottom, left }} key={`attack-${attackIndex}-${index}`}>Immune</div>;
                            break;

                        case "miss":
                            attackDiv = <div className={`attack miss ${element}`} style={{ bottom, left }} key={`attack-${attackIndex}-${index}`}>Miss</div>;
                            break;

                        case "crit":
                            attackDiv = <div className={`attack crit ${element}`} style={{ bottom, left }} key={`attack-${attackIndex}-${index}`}>{damage}</div>;
                            break;
                        case "normal":
                            attackDiv = <div className={`attack crit ${element}`} style={{ bottom, left }} key={`attack-${attackIndex}-${index}`}>{damage}</div>;
                            break;

                        default:
                            break;
                    }

                    return attackDiv;
                })
            }
            {
                attacks.map((x, index) => {

                    let newTotalDamage = 0;
                    let cloned = cloneObj<Attack[]>(attacks);
                    newTotalDamage = cloned.filter((_, _index) => _index <= index).map(x => x.damage).reduce((a,b) => a+b);

                    let element = "";

                    switch(x.element_id) {
                        case ELEMENT_GRASS:
                            element = "grass";
                            break;
                        case ELEMENT_FIRE:
                            element = "fire";
                            break;
                        case ELEMENT_WATER:
                            element = "water";
                            break;
                        case ELEMENT_CHAOS:
                            element = "chaos";
                            break;
                        default:
                            element = "chaos";
                            break;
                    }

                    return (
                        <span className={`attack-total attack-index-${attackIndex} crit ${element}`} key={`attack-total-${attackIndex}-${index}`}>{newTotalDamage.toFixed(0)}</span>
                    );
                })
            }
        </div>
    );
}

const EncounterHpBar = ({ currentHp, maxHp }: PlayerHpBarProps) => {
    currentHp = currentHp < 0? 0 : currentHp;
    let pct = Math.ceil((currentHp * 100/ maxHp));
    return (
        <div className="hp-bar encounter">
            <div className="hp-left" style={{ width: `${pct}%`, backgroundColor: 'crimson', color: 'white' }}></div>
            <div className='hp-number'>
                <span>{currentHp.toFixed(0)} / {maxHp.toFixed(0)}</span>
            </div>
        </div>
    )
}

const PlayerHpBar = ({ currentHp, maxHp }: PlayerHpBarProps) => {
    currentHp = currentHp < 0? 0 : currentHp;
    let pct = Math.ceil((currentHp * 100/ maxHp));
    return (
        <div className="hp-bar">
            <div className="hp-left" style={{ width: `${pct}%`, backgroundColor: 'greenyellow' }}></div>
            <div className='hp-number'>
                <span>{currentHp.toFixed(0)} / {maxHp.toFixed(0)}</span>
            </div>
        </div>
    )
}

const PlayerMonsterBar = ({ playerMonsters, onPlayerMonsterClick, monstersOnCd, activeMonsterId }: PlayerMonsterBarProps) => {
    const [currentActiveMonsterId, setCurrentActiveMonsterId] = useState("");
    const [currentActiveMonster, setCurrentActiveMonster] = useState<MonsterStats | undefined>(undefined);

    useEffect(() => {
        if(!activeMonsterId && Object.values(playerMonsters).length === 0) {
            return;
        }

        let nonEmptyActiveId = !activeMonsterId? Object.keys(playerMonsters)[0] : activeMonsterId;

        setCurrentActiveMonsterId(nonEmptyActiveId);
        setCurrentActiveMonster(playerMonsters[nonEmptyActiveId]);
    }, [activeMonsterId, playerMonsters]);

    if(!currentActiveMonster) {
        // set timer
        return null;
    }

    return (
        <div className="player-monster-bar">
            <div className="player-monster-container">
                {
                    Object.entries(playerMonsters).sort((a, _) => (currentActiveMonsterId === a[0]? -1 : 1)).map(x => {
                        const [monsterId, monster] = x;
                        return (
                        <div 
                            key={`player-monster-${monsterId}`}
                            className={`player-monster ${monstersOnCd.includes(monsterId)? 'on-cd' : ''}`}
                            onClick={() => { onPlayerMonsterClick(monsterId) }}
                        >
                            <img src={getMonsterIcon(monster.img_file, monster.element_id, monster.is_shiny)} alt="imageFile"></img>
                        </div>);
                    })
                }
            </div>
        </div>
    )
}

const PlayerSkillBar = ({socket, address, playerMonsterSkills, activeMonsterId, onSkillClick, isOnCd}: PlayerSkillBarProps) => {
    const [currentSkills, setCurrentSkills] = useState<MonsterSkill[]>([]);

    useEffect(() => {
        if(!activeMonsterId && Object.values(playerMonsterSkills).length === 0) {
            return;
        }

        let nonEmptyActiveId = !activeMonsterId? Object.keys(playerMonsterSkills)[0] : activeMonsterId;
        let skills = Object.values(playerMonsterSkills[nonEmptyActiveId]);

        setCurrentSkills(skills);
    }, [activeMonsterId, playerMonsterSkills]);

    const onInternalSkillClick = (skillId: number) => {
        let nonEmptyActiveId = !activeMonsterId? Object.keys(playerMonsterSkills)[0] : activeMonsterId;
        attack(socket, address, parseInt(nonEmptyActiveId), skillId);
        onSkillClick(nonEmptyActiveId);
    }

    return (
        <div className="battle-button-big-container">
            <div className={`battle-button-container ${isOnCd? 'on-cd' : ''}`}>
                {
                    currentSkills.map((x, index) => {
                        let circleClass = "";
                        switch(index) {
                            case 0:
                                circleClass = "top-left";
                                break;
                            case 1:
                                circleClass = "top-right";
                                break;
                            case 2:
                                circleClass = "bottom-left";
                                break;
                            case 3:
                                circleClass = "bottom-right";
                                break;
                            default:
                                circleClass = "top-left";
                                break;
                        }
                        return (
                            <button 
                                className={`battle-button ${circleClass}`} 
                                key={`skill_${x.id}`} 
                                onClick={() => {onInternalSkillClick(x.id)}}
                            >
                                <div className={circleClass}></div>
                                <span>{x.name}</span>
                            </button>
                        )
                    })
                }
                <div className="battle-center"></div>
            </div>
        </div>
    )
}

export default Battle;