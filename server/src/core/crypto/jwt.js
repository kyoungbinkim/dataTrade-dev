import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { getSkEncKey } from '../data/db.mysql';

/**
 * 
 * payload = {
 *  'loginTk' : hexString,
 * }
 * 
 * token = {
 *      loginTk : hexString
 *      token   : jwt token
 * }
 * 
 */

const jwtOpt = {
    algorithm : 'HS256',
    expiresIn : '30m',
}

export function getKey(loginTk) {
    const skEnc = getSkEncKey(loginTk)
}

export function sign(payload, sk) {
    const ret = jwt.sign(payload, sk, jwtOpt)
    return ret;
}

export function verify(token, sk) {
    let decoded;
    try {
        decoded = jwt.verify(token, sk);
    } catch (error) {
        console.log(error.message);
        return -1;
    }
    return decoded;
}


export const authMiddleWare = async (req, res, next) => {
    // console.log('access-token', req.headers['access-token'], req.query.token)
    const jwtHeader = JSON.parse((req.headers['access-token'] || req.query.token) ?? '{}')
    console.log(jwtHeader, req.headers);
    if(jwtHeader === {}){
        return res.send({
            msg : 'do not have token',
            err : -1
        })
    }
    console.log(jwtHeader, req.headers);
    try {
        
        const sk = await getSkEncKey(jwtHeader.loginTk);
        const token = jwtHeader.token;
        if(!token){
            return res.send({
                msg : 'do not have token',
                err : -1
            })
        }

        const verify = jwt.verify(token, sk)
        if(verify == -2) {
            return res.send({
                msg : "invalid token",
                err : -2
            })
        }
        else if(verify == -3 ){
            return res.send({
                msg : "expired token",
                err : -3
            })
        }

        console.log('ver : ', verify);
        next();
    } catch (error) {
        console.log(error);
        res.send('err');
    }
    
}

const jwtHelper = {
    sign,
    verify,
    authMiddleWare,
}

export default jwtHelper