/* global BigInt */
import _ from 'lodash';

/**
 * Padded before '0's up to length [width]
 *
 * @param {number} width
 * @return {String|string}
 */
String.prototype.fillZero = function (width) {
    return this.length >= width ?
        this :
        new Array(width-this.length+1).join('0') + this;
};

/**
 * Returns true if data satisfies the BigInt format, otherwise false.
 * ex) true: 1, 1n, 0b1, 0x1, ab, 0xab ...
 *
 * @param {any} data
 * @returns {boolean}
 */
export function isBigIntFormat(data) {
    if (_.isNil(data) || data === '') {
        return false;
    }
    if (typeof data === 'bigint') {
        return true;
    }
    return isNaN(data) ? !isNaN('0x' + data) : !isNaN(data);
}

export function isHexStringFormat(data) {
    if (data.substring(0, 2) !== '0x') {
        return false;
    }
    return isBigIntFormat(data);
}

/**
 *
 * @param {string} hexString hexadecimal string
 * @returns {BigInt}
 */
export function hexToInt(hexString) {
    if (hexString.toString().substring(0, 2) !== '0x')
        hexString = '0x' + hexString;
    // console.log(hexString);
    return BigInt(hexString);
}

/**
 *
 * @param {Array[string]} hexList hexadecimal string array
 * @returns {Array[BigInt]}
 */
export function hexListToIntList(hexList) {
    const intList = [];
    for (let i = 0; i < hexList.length; i++) {
        intList[i] = hexToInt(hexList[i]);
    }
    return intList;
}

/**
 *
 * @param {string} hexString    hexadecimal string
 * @returns {Array}             bytes array
 */
export function hexToBytes(hexString) {
    if (hexString.toString().substring(0, 2) === '0x')
        hexString = hexString.substring(2);
    for (var bytes = [], c = 0; c < hexString.length; c += 2)
        bytes.push(parseInt(hexString.substr(c, 2), 16));
    return bytes;
}

export function decStrToHex(decString) {
    return BigInt(decString).toString(16);
}

export function hexStrToDec(hexString) {
    return BigInt(addPrefixHex(hexString)).toString(10);
}

export function decArrayToHexArray(decArray) {
    const hexArray = [];
    for (let i = 0; i < decArray.length; i++) {
        hexArray[i] = decStrToHex(decArray[i]);
    }
    return hexArray;
}

export function hexArrayToDecArray(hexArray) {
    const decArray = [];
    for (let i = 0; i < hexArray.length; i++) {
        decArray[i] = hexStrToDec(hexArray[i]);
    }
    return decArray;
}

export function padZeroHexString(hexString, length = 64) {
    if (hexString.substring(0, 2) === '0x') {
        return hexString.substring(2, hexString.length).padStart(length, '0');
    } else {
        return hexString.substring(0, hexString.length).padStart(length, '0');
    }
}

/**
 *
 * @param {Array}       items            Array to flatten
 * @returns
 */
export function flatten(items) {
    const flat = [];
    items.forEach(item => {
        if (Array.isArray(item)) {
            flat.push(...flatten(item));
        } else {
            flat.push(item);
        }
    });

    return flat;
}

export function addPrefixHex(hexString) {
    if (hexString.substring(0, 2) !== '0x') {
        return '0x' + hexString;
    } else {
        return hexString;
    }
}

export function subtractPrefixHex(hexString) {
    if (hexString.substring(0, 2) !== '0x') {
        return hexString;
    } else {
        return hexString.substring(2, hexString.length);
    }
}

/**
 * Recursively remove '0x' in object.
 *
 * Note: Change the original data of [obj].
 *      Please deep copy [obj] and use it.
 * @param {object} obj Hex string object
 */
export function removeHexRepresentation(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].replace('0x', '');
        } else if (typeof obj[key] === 'object') {
            removeHexRepresentation(obj[key]);
        }
    }
}

export function addPrefixAndPadHex(hexString, length = 64) {
    hexString = padZeroHexString(hexString, length);

    return '0x' + hexString;
}

export function addPrefixHexFromArray(hexArray) {
    const flat = [];
    hexArray.forEach(element => {
        if (Array.isArray(element)) {
            flat.push(...addPrefixHexFromArray(element));
        } else {
            flat.push(addPrefixHex(element));
        }
    });

    return flat;
}

export function addPrefixAndPadHexFromArray(hexArray, length = 64) {
    const flat = [];
    hexArray.forEach(element => {
        if (Array.isArray(element)) {
            flat.push(...addPrefixAndPadHexFromArray(element, length));
        } else {
            flat.push(addPrefixAndPadHex(element, length));
        }
    });

    return flat;
}

/**
 *  A comma is added to [number] every 3 digits.
 *  ex) Number(1000) => string(1,000)
 *
 * @param {string | Number | BigInt} number
 * @throws not Bigint Format
 * @returns {string} 3 digits comma
 */
export function addComma(number) {
    if (number === '0' || number === 0 || number === BigInt('0')) {
        return '0';
    }

    if (typeof number === 'string' && parseFloat(number)) {
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    else if (typeof number === 'bigint') {
        return number.toString(10).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    else if (typeof number === 'number') {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

export function asciiToHex(str) {
    let arr = [];
    for (let n = 0, l = str.length; n < l; n++) {
        let hex = Number(str.charCodeAt(n)).toString(16);
        arr.push(hex);
    }

    return arr.join('');
}

export function decToHex(decStr){
    try {
        return '0x' + BigInt(decStr).toString(16);
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

const types = {
    isBigIntFormat,
    isHexStringFormat,
    hexToInt,
    hexListToIntList,
    hexToBytes,
    decStrToHex,
    hexStrToDec,
    decArrayToHexArray,
    hexArrayToDecArray,
    padZeroHexString,
    flatten,
    addPrefixHex,
    subtractPrefixHex,
    removeHexRepresentation,
    addPrefixAndPadHex,
    addPrefixHexFromArray,
    addPrefixAndPadHexFromArray,
    addComma,
    asciiToHex,
    decToHex
};


export default types;