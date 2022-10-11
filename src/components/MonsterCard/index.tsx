import React, { useCallback, useState } from 'react';
import './styles.scss'
import { getMonsterImage, runIfFunction } from '../../common/utils';
import { MonsterCardProps } from './types';

const MonsterCard = ({
    imageFile,
    elementId,
    isShiny,

    attack,
    defense,
    hp,
    crit,

    additionalInfo,
    children,

    showMintButton,
    mintButtonText,
    onMintButtonClick,
    disableMintButton,
}: MonsterCardProps) => {
    const [showInfo, setShowInfo] = useState(false);

    const displayInfo = useCallback(() => {
        setShowInfo(true);
    }, []);

    const hideInfo = useCallback(() => {
        setShowInfo(false);
    }, []);

    attack = typeof(attack) === 'string'? attack : attack.toFixed(0);
    defense = typeof(defense) === 'string'? defense : defense.toFixed(0);
    hp = typeof(hp) === 'string'? hp : hp.toFixed(0);
    crit = typeof(crit) === 'string'? crit : crit.toFixed(0);

    return (
        <div className='monster-card'>
            <div className="monster-image-container">
                <img src={getMonsterImage(imageFile, elementId, isShiny)} alt="monster_img"></img>
                <div className="stats">
                    <div className="attack">
                        <span>{attack}</span>
                    </div>
                    <div className="defense">
                        <span>{defense}</span>
                    </div>
                    <div className="hp">
                        <span>{hp}</span>
                    </div>
                    <div className="crit">
                        <span>{crit}</span>
                    </div>
                </div>
                {
                    additionalInfo &&
                    <div className={`info-button ${showInfo? 'active' : ''}`} onMouseEnter={displayInfo} onMouseLeave={hideInfo}>{ showInfo && additionalInfo}</div>
                }
            </div>
            
            {
                showMintButton &&
                <button 
                    className={`mint-button ${disableMintButton? 'disabled' : ''}`} 
                    disabled={disableMintButton}
                    onClick={() => {runIfFunction(onMintButtonClick)}}
                >
                    {mintButtonText}
                </button>
            }
            
            {children}
        </div>
    )
}

export default MonsterCard;