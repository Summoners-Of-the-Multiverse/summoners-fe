import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './styles.scss'
import { Socket } from 'socket.io-client';
import { AddressContext, SocketContext } from '../../App';
import { cloneObj, getRandomNumber, getRandomNumberAsString } from '../../common/utils';
import { StartBattleParams, BattleDetails, BattlePageProps, EncounterEffectProps, EncounterImageProps, MonsterEquippedSkillById, PlayerHpBarProps, PlayerMonsterBarProps, EncounterHit, EncounterDamageReceived, SkillUsage, PlayerSkillBarProps, MonsterSkill, Attack } from './types';

let playerMonsterSkills: {[id: string]: MonsterEquippedSkillById } = {};
const AUTO_BATTLE = false;

const startBattle = ({
    socket,
    isInBattle,
    address,
    chainId,
    areaId,
    onLoad,
    onEncounterReceivedDamage,
    onDamageReceived,
    onMonsterOffCd,
    onEndSkillsReceived,
    onBattleEnd,
}: StartBattleParams ) => {
    if(isInBattle) {
        return;
    }

    isInBattle = true;
    
    console.log('starting battle')
    if(address) {
        socket.emit('start_battle', {address, chainId, areaId});
        socket.on('invalid_battle', () => { onBattleEnd(false) });
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
            isInBattle = false;
            onBattleEnd(false);
            console.log('Battle Lost')
        });

        socket.on('battle_won', () => {
            isInBattle = false;
            onBattleEnd(true);
            console.log('Battle Won')
        });
    }

    return () => {
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

const getMonsterImage = (assetFile: string) => {
    return `/assets/sprites/${assetFile}`;
}

const getEffect = (assetFile: string) => {
    return `/assets/effects/${assetFile}`;
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

    const onLoad = (battleDetails: BattleDetails) => {
        setEncounterCurrentHp(-1);
        setPlayerCurrentHp(-1);
        setBattleDetails(battleDetails);
    }

    const onBattleEnd = (hasWon: boolean) => {
        //30s timer
        if(hasWon) {
            setEncounterCurrentHp(0);
        }

        else {
            setPlayerCurrentHp(0);
        }
        
        // setTimeout(() => setIsInBattle(false), 3000);
    }

    const onEncounterReceivedDamage = ({attacks, encounterHpLeft, monsterId, skillId}: EncounterDamageReceived) => {
        setEncounterCurrentHp(encounterHpLeft);
        setEncounterDamageReceived({attacks, encounterHpLeft, monsterId, skillId});
    }

    const onDamageReceived = ({ damage, playerHpLeft }: EncounterHit) => {
        setPlayerCurrentHp(playerHpLeft);
    }

    const onMonsterOffCd = (monsterId: number) => {
        setMonsterIdOffCd(monsterId.toString());

        setTimeout(() => {
            setMonsterIdOffCd(undefined);
        }, 10);
    }

    const onEndSkillsReceived = () => {

    }

    const handleStartBattle = () => {
        setIsInBattle(true);
        startBattle({
            socket, 
            isInBattle, 
            address, 
            chainId: chain, 
            areaId: 1, 
            onLoad, 
            onEncounterReceivedDamage,
            onDamageReceived,
            onMonsterOffCd,
            onEndSkillsReceived,
            onBattleEnd,
        });
    }

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
    }, [monsterIdOffCd]);

    //register current monsters on cd
    useEffect(() => {
        previousMonstersOnCd.current = cloneObj<string[]>(monstersOnCd);
    }, [monstersOnCd]);

    const onSkillClick = useCallback((monsterId: string) => {
        let cloned = cloneObj<string[]>(monstersOnCd);
        cloned.push(monsterId);
        setMonstersOnCd(cloned);
    }, [monstersOnCd]);

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
            <PlayerSkillBar
                socket={socket}
                address={address}
                playerMonsterSkills={playerMonsterSkills}
                activeMonsterId={nonNullActiveMonsterId}
                onSkillClick={onSkillClick}
                isOnCd={monstersOnCd.includes(activeMonsterId)}
            />
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
            <img className='encounter-img' src={getMonsterImage(encounter.img_file)} alt="encounter_img"></img>
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
    const [randomBottom, setRandomBottom] = useState("0%");
    const [randomLeft, setRandomLeft] = useState("50%");

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

        let randomBottom = getRandomNumberAsString(0, 30) + "%";
        let randomLeft = getRandomNumberAsString(30, 60) + "%";

        setRandomBottom(randomBottom);
        setRandomLeft(randomLeft);

        setTimeout(() => {
            setAttacks(encounterDamageReceived.attacks);
        }, 10);

    }, [encounterDamageReceived, skills, monsterId]);

    return (
        <div className={`attacks`} style={{ bottom: randomBottom, left: randomLeft }}>
            {
                attacks.map((x, index) => {
                    let damage = x.damage.toFixed(0);
                    switch(x.type) {
                        case "immune":
                            return (<div className='attack immune' key={`attack-${attackIndex}-${index}`}>Immune</div>)
                        case "miss":
                            return (<div className='attack miss' key={`attack-${attackIndex}-${index}`}>Miss</div>)
                        case "crit":
                            return (<div className='attack crit' key={`attack-${attackIndex}-${index}`}>{damage}</div>)
                        case "normal":
                            return (<div className='attack normal' key={`attack-${attackIndex}-${index}`}>{damage}</div>)
                        default:
                            return null;
                    }
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
    const [currentActiveMonster, setCurrentActiveMonster] = useState("");

    useEffect(() => {
        if(!activeMonsterId && Object.values(playerMonsters).length === 0) {
            return;
        }

        let nonEmptyActiveId = !activeMonsterId? Object.keys(playerMonsters)[0] : activeMonsterId;
        setCurrentActiveMonster(nonEmptyActiveId);
    }, [activeMonsterId, playerMonsters]);

    return (
        <div className="player-monster-image-container">
            {
                Object.entries(playerMonsters).map(x => {
                    const [monsterId, monster] = x;
                    return (
                    <button 
                        key={`player-monster-image-${monsterId}`}
                        className={`player-monster-image ${monstersOnCd.includes(monsterId)? 'on-cd' : ''} ${currentActiveMonster === monsterId? 'active' : ''}`}
                        onClick={() => { onPlayerMonsterClick(monsterId) }}
                    >
                        <img src={getMonsterImage(monster.img_file)} alt="monster_image"></img>
                    </button>);
                })
            }
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