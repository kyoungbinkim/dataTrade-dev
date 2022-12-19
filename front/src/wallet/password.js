import KeyHelper from './keyHelper.js';
import MiMC from '../crypto/mimc.js';
import types from '../utils/types.js';
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


export function getPassWordToken(pw){
    const hash = new MiMC.MiMC7();
    return hash.hash(types.asciiToHex(pw));
}

const Login = {
    isValidPassword,
    isEqualPassword,
    getPassWordToken,
    getToken,
};

export default Login;