import React, { useEffect, useState } from 'react';
import { ELEMENT_CHAOS, ELEMENT_FIRE, ELEMENT_GRASS, ELEMENT_WATER } from '../../common/constants';
import { ElementIconProps } from './types';
import './styles.scss';

const ElementIcon = ({elementId, size}: ElementIconProps) => {
    const [elementIcon, setElementIcon] = useState('');

    useEffect(() => {
        let elementIcon = "";
        switch(elementId) {
            case ELEMENT_WATER:
                elementIcon = "mdi-water";
                break;
            case ELEMENT_CHAOS:
                elementIcon = "mdi-decagram";
                break;
            case ELEMENT_GRASS:
                elementIcon = "mdi-leaf";
                break;
            case ELEMENT_FIRE:
                elementIcon = "mdi-fire";
                break;
            default:
                break;
        }

        setElementIcon(elementIcon);
    }, [elementId]);

    return (
        <i className={`mdi ${elementIcon} element-icon`} style={{ fontSize: size }}></i>
    )
}

export default ElementIcon;