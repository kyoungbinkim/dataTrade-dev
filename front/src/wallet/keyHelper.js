import Web3 from '../../web3';
import types from '../utils/types.js';
// import Config from 'react-native-config';
import Config from '../utils/config.js';
import encryption from '../cryptos/encryption.js';
import * as KeyChain from 'react-native-keychain'; // Ref. https://github.com/oblador/react-native-keychain
import mimc from '../cryptos/mimc.js';
import _ from 'lodash';

// TODO: Azeroth Key 기능과 ethers key 기능 분리


/**
 *
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export async function isValidToken(token) {
    if (!types.isBigIntFormat(token)) {
        return false;
    }
    let userCredential;
    try {
        userCredential = await KeyChain.getGenericPassword();
    } catch (error) {
        console.error('Keychain couldn\'t be accessed!', error);
        throw error;
    }
    const _token = _.get(userCredential, 'username');
    return (_token === token && !_.isNil(_token));
}

/**
 * @param {string}      address     EOA address 20byte
 * @returns {boolean}
 */
export function isValidAddress(address) {
    return Web3.Web3Interface.isValidAddress(address);
}

/**
 * @param {string}     privateKey     The private key of 'address' 32byte
 * @returns {Promise<boolean>}
 */
export async function isValidPrivateKey(privateKey) {
    const web3 = new Web3.Web3Interface(Config.DEFAULT_ENDPOINT);
    return web3.isValidPrivateKey(privateKey);
}

/**
 * @param {string}     address     ENA address 32byte string
 * @param {string}     pkOwn     pk_own 32byte string
 * @param {string}     pkEnc     pk_enc 32byte string
 * @returns {boolean}
 */
export function isValidPubKey(address, pkOwn, pkEnc) {
    if (!types.isBigIntFormat(address) ||
        !types.isBigIntFormat(pkOwn) ||
        !types.isBigIntFormat(pkEnc)) {
        return false;
    }
    address = types.subtractPrefixHex(address);
    pkOwn = types.subtractPrefixHex(pkOwn);
    pkEnc = types.subtractPrefixHex(pkEnc);

    const mimc7 = new mimc.MiMC7();
    const recoveredAddress = mimc7.hash(pkOwn, pkEnc);

    return address === recoveredAddress;
}

/**
 * @param {string} usk           Private key of azeroth, it means 'usk'
 * @returns {boolean}
 */
export function isValidUSK(usk) {
    if (_.isNil(usk) || !types.isBigIntFormat(usk)) {
        return false;
    }
    return types.hexToInt(usk).toString(2).length <= 254;
}

/**
 *
 * @param {string}              token           User's login token, which is key of symmetric key encryption, format. HASH(password)
 * @param {object}              wallet
 * @param {string}              wallet.address          The external address, which is the value of 'username' stored within the server
 * @param {string}              wallet.privateKey         The privat key of 'exAddr'. It is stored in the form of ciphertext using symmetric key encryption
 * @returns  {Promise<false | Result>}            Result if the proccess succeeded, otherwise false
 */
export async function setExAddrAndPrivKey(token, wallet) {
    if (!types.isBigIntFormat(token) ||
        !isValidAddress(wallet.address) ||
        !(await isValidPrivateKey(wallet.privateKey))) {
        return false;
    }

    const symm = new encryption.symmetricKeyEncryption(token);
    let privateKey = wallet.privateKey;
    if (privateKey.substring(0, 2) === '0x') {
        privateKey = privateKey.substring(2);
    }

    const encDataArr = {
        left: symm.Enc(privateKey.substring(0, privateKey.length / 2)),
        right: symm.Enc(privateKey.substring(privateKey.length / 2)),
    };

    return KeyChain.setInternetCredentials(token, wallet.address, JSON.stringify(encDataArr));
}

/**
 *
 * @param {string}              token
 * @returns {Promise<null | [string, string]>}     Return [external address, private key] of its address
 */
export async function getExAddrAndExPrivKey(token) {
    if (!(await isValidToken(token))) {
        return null;
    }
    const data = await KeyChain.getInternetCredentials(token);
    if (data === false || _.isNil(data.username) || _.isNil(data.password)) {
        return null;
    }
    const exAddr = data.username;
    const encryptedData = JSON.parse(data.password);

    const leftsCT = new encryption.sCT(encryptedData.left.r, encryptedData.left.ct);
    const rightsCT = new encryption.sCT(encryptedData.right.r, encryptedData.right.ct);

    const symm = new encryption.symmetricKeyEncryption(token);
    const exPrivKey = '0x' + symm.Dec(leftsCT).fillZero(32) + symm.Dec(rightsCT).fillZero(32);

    return [exAddr, exPrivKey];
}

/**
 *
 * @param {string}              token
 * @param wallet
 * @returns {Promise<false | Result>}
 */
export async function setUserKey(token, wallet) {
    if (!types.isBigIntFormat(token)) {
        console.error('Invalid token !');
        return false;
    }

    if (!(await setExAddrAndPrivKey(token, wallet))) {
        return false;
    }

    const usk = deriveUskFromPrivateKey(wallet.privateKey);
    const upk = Web3.Azeroth.structure.Key.UserKey.recoverFromUserSk(usk);
    if (_.isNil(upk)) {
        return false;
    }
    const symm = new encryption.symmetricKeyEncryption(token);

    const encSk = symm.Enc(usk);
    const keyData = {
        upk: upk,
        encSk: encSk,
    };
    return KeyChain.setGenericPassword(token, JSON.stringify(keyData));
}

/**
 *
 * @returns {Promise<{ena, pkOwn, pkEnc} | undefined>}
 */
export async function getUserPubKey() {
    let userCredential;
    try {
        userCredential = await KeyChain.getGenericPassword();
    } catch (error) {
        console.error('Keychain couldn\'t be accessed!', error);
        throw error;
    }
    if (!userCredential) {
        return undefined;
    }
    return (_.get(JSON.parse(userCredential.password), 'upk'));
}

/**
 *
 * @param {string}              token
 * @returns {Promise<string | undefined>}
 */
export async function getUserPrivKey(token) {
    let userCredential;
    try {
        userCredential = await KeyChain.getGenericPassword();
    } catch (error) {
        console.error('Keychain couldn\'t be accessed!', error);
        throw error;
    }
    if (!userCredential || !await isValidToken(token)) {
        return undefined;
    }

    const pwd = _.get(userCredential, 'password');
    if (!pwd) {
        return undefined;
    }

    const encPrivKey = _.get(JSON.parse(pwd), 'encSk');
    const symm = new encryption.symmetricKeyEncryption(token);

    return symm.Dec(encPrivKey);
}

/**
 * 
 * @param {string}          privateKey 
 * @returns {string}    user SK
 */
export function deriveUskFromPrivateKey(privateKey) {
    const mimc7 = new mimc.MiMC7();

    if (!types.isHexStringFormat(privateKey)) {
        return false;
    }

    return mimc7.hash(privateKey);
}

const KeyHelper = {
    isValidAddress,
    isValidPrivateKey,
    isValidPubKey,
    isValidUSK,
    setExAddrAndPrivKey,
    getExAddrAndExPrivKey,
    setUserKey,
    getUserPubKey,
    getUserPrivKey,
    deriveUskFromPrivateKey
};

export default KeyHelper;