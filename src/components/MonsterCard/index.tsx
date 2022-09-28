import React, { useCallback, useState } from 'react';
import './styles.scss'
import { getMonsterImage } from '../../common/utils';
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
    children
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
                    <span className='attack'>{attack}</span>
                    <span className='defense'>{defense}</span>
                    <span className='hp'>{hp}</span>
                    <span className='crit'>{crit}</span>
                </div>
            </div>
            {
                additionalInfo &&
                <div className={`info-button ${showInfo? 'active' : ''}`} onMouseEnter={displayInfo} onMouseLeave={hideInfo}>{ showInfo && additionalInfo}</div>
            }
            {children}
        </div>
    )
}

export default MonsterCard;