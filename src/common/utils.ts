import moment from 'moment';
import { ELEMENT_CHAOS, ELEMENT_FIRE, ELEMENT_GRASS, ELEMENT_WATER } from './constants';

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

export const getSkillIcon = (assetFile: string) => {
    return `/assets/skills/${assetFile}`;
}

export const getMonsterBattleImage = (assetFile: string) => {
    return `/assets/sprites/base/${assetFile}`;
}

export const getMonsterImage = (assetFile: string, elementId: number, isShiny: boolean) => {
    let file = "";
    switch(elementId) {
        case ELEMENT_GRASS:
            file = "green";
            break

        case ELEMENT_FIRE:
            file = "red";
            break

        case ELEMENT_WATER:
            file = "blue";
            break

        case ELEMENT_CHAOS:
            file = "grey";
            break

        default:
            file = "base";
            break
    }
    file += isShiny? "_shiny" : "";
    return `/assets/sprites/${file}/${assetFile}`;
}

export const getMonsterIcon = (assetFile: string, elementId: number, isShiny: boolean) => {
    let file = "";
    switch(elementId) {
        case ELEMENT_GRASS:
            file = "green";
            break

        case ELEMENT_FIRE:
            file = "red";
            break

        case ELEMENT_WATER:
            file = "blue";
            break

        case ELEMENT_CHAOS:
            file = "grey";
            break

        default:
            file = "base";
            break
    }
    file = "icon_" + file + (isShiny? "_shiny" : "");
    return `/assets/sprites/${file}/${assetFile}`;
}

export const getEffect = (assetFile: string) => {
    return `/assets/effects/${assetFile}`;
}

export const truncateStr = (fullStr: string, strLen: number, separator='..') => {
    if (fullStr.length <= strLen) return fullStr;

    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);

    return fullStr.substr(0, frontChars) +
           separator +
           fullStr.substr(fullStr.length - backChars);
}

export const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
}

export const ucFirst = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}