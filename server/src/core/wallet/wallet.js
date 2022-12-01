import KeyHelper from './keyHelper';
import { Notes } from '../notes/notes';
import errorEnum from '../../utils/error.enum';
import { Wallet } from '@ethersproject/wallet';
import { ethers } from 'ethers';
import { createTable } from '../../db';
import Login from './password';
import _ from 'lodash';

// TODO: Azeroth Key 기능과 ethers key 기능 분리

/**
 * 
 * @param {string}      password 
 * @param {string}      chkPassword 
 * @returns {Promise<false | Result>}
 */
export async function createWallet(password, chkPassword) {
    if (!Login.isValidPassword(password) ||
        !Login.isEqualPassword(password, chkPassword)) {
        throw errorEnum.ERR_INVALID_PASSWORD;
    }
    const token = Login.getToken(password);
    let wallet;
    try {
        wallet = Wallet.createRandom();
    } catch (error) {
        console.error('@ethersproject/wallet couldn\'t be created', error);
        throw error;
    }

    if (await KeyHelper.setUserKey(token, wallet) === false) {
        throw errorEnum.ERR_SET_USER_KEY;
    }

    const pubKey = await KeyHelper.getUserPubKey(token);
    if (_.isNil(pubKey)) {
        throw errorEnum.ERR_GET_PUB_KEY;
    }

    const mnemonic = wallet.mnemonic.phrase;
    await Notes.init();
    await createTable();

    const exPrivKey = _.get(wallet, 'privateKey');

    return { token, pubKey, mnemonic, exPrivKey };
}

/**
 * 
 * @param {string}                  password 
 * @param {string}                  chkPassword 
 * @param {Object}                  data
 * @param {string}                  data.privateKey 
 * @param {string}                  data.mnemonic
 * @returns {Promise<Result>}
 */
export async function fetchWallet(password, chkPassword, data) {
    if (!Login.isValidPassword(password) ||
        !Login.isEqualPassword(password, chkPassword)) {
        throw errorEnum.ERR_INVALID_PASSWORD;
    }
    const token = Login.getToken(password);
    let wallet;
    if (!_.isNil(_.get(data, 'mnemonic'))) {
        if (!ethers.utils.isValidMnemonic(data.mnemonic)) {
            throw errorEnum.ERR_INVALID_MNEMONIC;
        }
        wallet = Wallet.fromMnemonic(data.mnemonic);
    } else if (!_.isNil(_.get(data, 'privateKey'))) {
        if (!(await KeyHelper.isValidPrivateKey(data.privateKey))) {
            throw errorEnum.ERR_INVALID_PRIVATE_KEY;
        }
        wallet = new Wallet(data.privateKey);
    } else {
        throw errorEnum.ERR_INVALID_DATA_TYPE;
    }

    if (await KeyHelper.setUserKey(token, wallet) === false) {
        throw errorEnum.ERR_SET_USER_KEY;
    }
    const privateKey = wallet.privateKey;
    const pubKey = await KeyHelper.getUserPubKey(token);
    if (_.isNil(pubKey)) {
        throw errorEnum.ERR_GET_PUB_KEY;
    }

    await Notes.init();
    await createTable();

    return { token, pubKey, privateKey };
}

const wallet = {
    createWallet,
    fetchWallet
};

export default wallet;