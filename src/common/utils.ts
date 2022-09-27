import moment from 'moment';

const ELEMENT_GRASS = 1;
const ELEMENT_FIRE = 2;
const ELEMENT_WATER = 3;
const ELEMENT_CHAOS = 4;

export function sleep(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    });
}

/**
 * Returns the number with 'en' locale settings, ie 1,000
 * @param x number
 * @param minDecimal number
 * @param maxDecimal number
 */
 export function toLocaleDecimal(x: number, minDecimal: number, maxDecimal: number) {
    return x.toLocaleString('en', {
        minimumFractionDigits: minDecimal,
        maximumFractionDigits: maxDecimal,
    });
}

/**
 * Runs the function if it's a function, returns the result or undefined
 * @param fn 
 * @param args 
 */
export const runIfFunction = (fn: any, ...args: any): any | undefined => {
    if(typeof(fn) == 'function'){
        return fn(...args);
    }

    return undefined;
}

/**
 * Returns the ellipsized version of string
 * @param x string
 * @param leftCharLength number
 * @param rightCharLength number
 */
export function ellipsizeThis(x: string, leftCharLength: number, rightCharLength: number) {
    if(!x) {
        return x;
    }

    let totalLength = leftCharLength + rightCharLength;

    if(totalLength >= x.length) {
        return x;
    }

    return x.substring(0, leftCharLength) + "..." + x.substring(x.length - rightCharLength, x.length);
}

/**
 * Returns the new object that has no reference to the old object to avoid mutations.
 * @param obj 
 */
export const cloneObj = <T = any>(obj: {[key: string]: any}) => {
    return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * @returns string
 */
export const getRandomColor = () => {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export const getRandomNumber = (min: number, max: number, isInteger = false) => {
    let rand = min + (Math.random() * (max - min));
    if(isInteger) {
        rand = Math.round(rand);
    }

    else {
        // to 3 decimals
        rand = Math.floor(rand * 1000) / 1000;
    }

    return rand;
}

export const getRandomChance = () => {
    return getRandomNumber(0, 100);
}

export const getRandomNumberAsString = (min: number, max: number, isInteger = false) => {
    return getRandomNumber(min, max, isInteger).toString();
}

export const getRandomChanceAsString = () => {
    return getRandomNumberAsString(0, 100);
}

export const getUTCMoment = () => {
    return moment().utc();
}

export const getUTCDatetime = () => {
    return getUTCMoment().format('YYYY-MM-DD HH:mm:ss');
}

export const getUTCDate = () => {
    return getUTCMoment().format('YYYY-MM-DD');
}

export const getBaseUrl = () => {
    return process.env.REACT_APP_BASE_URL;
}

export const getMonsterBattleImage = (assetFile: string) => {
    return `/assets/sprites/normal/${assetFile}`;
}

export const getMonsterImage = (assetFile: string, elementId: number) => {
    switch(elementId) {
        case ELEMENT_GRASS:
            return `/assets/sprites/green/${assetFile}`;

        case ELEMENT_FIRE:
            return `/assets/sprites/red/${assetFile}`;

        case ELEMENT_WATER:
            return `/assets/sprites/blue/${assetFile}`;

        case ELEMENT_CHAOS:
            return `/assets/sprites/grey/${assetFile}`;

        default:
            return `/assets/sprites/normal/${assetFile}`;
    }
}

export const getMonsterIcon = (assetFile: string, elementId: number) => {
    switch(elementId) {
        case ELEMENT_GRASS:
            return `/assets/sprites/icon_green/${assetFile}`;

        case ELEMENT_FIRE:
            return `/assets/sprites/icon_red/${assetFile}`;

        case ELEMENT_WATER:
            return `/assets/sprites/icon_blue/${assetFile}`;

        case ELEMENT_CHAOS:
            return `/assets/sprites/icon_grey/${assetFile}`;

        default:
            return `/assets/sprites/normal/${assetFile}`;
    }
}

export const getEffect = (assetFile: string) => {
    return `/assets/effects/${assetFile}`;
}