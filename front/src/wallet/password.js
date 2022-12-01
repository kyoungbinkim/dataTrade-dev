import KeyHelper from './keyHelper.js';
import MiMC from '../cryptos/mimc.js';
import types from '../../utils/types.js';
import errorEnum from '../../utils/error.enum';
import _ from 'lodash';

/**
 *
 * @param {string}          password            User's password
 * @returns {boolean}
 */
export function isValidPassword(password) {
    const reg = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*~])(?=.{8,})');
    return !(_.isNil(password) || !reg.test(password));
}

/**
 * 
 * @param {string}          password            User's password 
 * @param {string}          chkPassword         User's check password
 * @returns 
 */
export function isEqualPassword(password, chkPassword) {
    return password === chkPassword;
}

/**
 *
 * @param {string} password     raw password
 * @returns {string|undefined}  H(password)
 */
export function getToken(password) {
    if (!isValidPassword(password)) {
        return undefined;
    }
    const hash = new MiMC.MiMC7();
    return hash.hash(types.asciiToHex(password));
}

/**
 * 
 * @param {string}              password                User's password 
 * @returns 
 */
export async function login(password) {
    if (!isValidPassword(password)) {
        throw errorEnum.ERR_INVALID_PASSWORD;
    }
    const token = getToken(password);

    const [exAddr, exPrivKey] = await KeyHelper.getExAddrAndExPrivKey(token);
    if (_.isNil(exAddr)) {
        throw errorEnum.ERR_GET_EXADDR_AND_PRIVKEY;
    }
    const pubKey = await KeyHelper.getUserPubKey(token);
    if (_.isNil(pubKey)) {
        throw errorEnum.ERR_GET_PUB_KEY;
    }

    return [exAddr, exPrivKey, pubKey, token];
}

const Login = {
    isValidPassword,
    isEqualPassword,
    getToken,
    login,
};

export default Login;s