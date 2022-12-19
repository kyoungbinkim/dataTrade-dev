import _ from 'lodash';
import math from '../utils/math.js'
import constants from '../utils/constants.js';
import Curve from '../crypto/curve.js';
import mimc from '../crypto/mimc.js';
import types from '../utils/types.js';


class UserKey {
    constructor({ena, pkOwn, pkEnc}, sk){
        this.pk = {
            ena : ena,
            pkOwn : pkOwn,
            pkEnc : pkEnc
        };
        this.sk = sk;
    }

    toJson(){
        return JSON.stringify({
            ena   : this.pk.ena,
            pkOwn : this.pk.pkOwn,
            pkEnc : this.pk.pkEnc,
            sk    : this.sk
        });
    }

    static fromJson(userKeyJson) {
        const userKey = JSON.parse(userKeyJson);
        return new UserKey(
            {
                ena     : _.get(userKey, "ena"),
                pkOwn   : _.get(userKey, "pkOwn"),
                pkEnc   : _.get(userKey, "pkEnc")
            },
            _.get(userKey, "sk")
        );
    }

    static keyGen() {
        const mimc7 = new mimc.MiMC7();

        const sk = math.randomFieldElement(constants.SUBGROUP_ORDER);
        const userPublicKey = {
            ena : null,
            pkOwn : mimc7.hash(sk.toString(16)),
            pkEnc : Curve.basePointMul(sk).toString(16)
        };
        // azerothFront code userPublicKey.pkEnc.toString(16)
        userPublicKey.ena =  mimc7.hash(userPublicKey.pkOwn, userPublicKey.pkEnc);

        return new UserKey(userPublicKey, sk.toString(16));
    }

    static recoverFromUserSk(sk){
        const mimc7 = new mimc.MiMC7();

        // 왜 string -> bigint -> string으로 구현했을까
        const skBigInt = types.hexToInt(sk);

        const userPublicKey = {
            ena : null,
            pkOwn : mimc7.hash(skBigInt.toString(16)),
            pkEnc : Curve.basePointMul(skBigInt).toString(16)
        };

        // azerothFront code userPublicKey.pkEnc.toString(16)
        userPublicKey.ena =  mimc7.hash(userPublicKey.pkOwn, userPublicKey.pkEnc);

        return userPublicKey;
    }

    static recoverFromIdPw(id, pw){

        console.log("in")
        const mimc7 = new mimc.MiMC7();
        const sk = MakePrivKey(id, pw);
        const userPubkey = this.recoverFromUserSk(sk);
        console.log(JSON.stringify(userPubkey));
        return new UserKey(userPubkey, sk);

    }
}

export function recoverFromIdPw(id,pw){
    console.log("in")
        const sk = MakePrivKey(id, pw);
        const userPubkey = UserKey.recoverFromUserSk(sk);
        console.log(JSON.stringify(userPubkey));
        return new UserKey(userPubkey, sk);
}

export function MakePrivKey(id, pw){
    const mimc7 = new mimc.MiMC7();
    const sk = mimc7.hash(types.asciiToHex(id).padEnd(32,0), pw.padEnd(32, 0));
    return sk;
}

export default {
    UserKey
};