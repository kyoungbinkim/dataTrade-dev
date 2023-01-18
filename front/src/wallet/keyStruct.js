/* global BigInt */
import _ from 'lodash';
import math from '../utils/math.js'
import constants from '../utils/constants.js';
import Curve from '../crypto/curve.js';
import mimc from '../crypto/mimc.js';
import types from '../utils/types.js';


export default class UserKey {
    // ena : addr
    constructor({ena, pkOwn, pkEnc}, skEnc, skOwn){
        this.pk = {
            ena : ena,
            pkOwn : pkOwn,
            pkEnc : pkEnc
        };
        this.skEnc = skEnc;
        this.skOwn = skOwn;
    }

    toJson(){
        return JSON.stringify({
            ena   : this.pk.ena,
            pkOwn : this.pk.pkOwn,
            pkEnc : this.pk.pkEnc,
            skEnc : this.skEnc,
            skOwn : this.skOwn,
        }, null, 2);
    }

    pubKeyToJson(){
        return JSON.stringify({
            ena   : this.pk.ena,
            pkOwn : this.pk.pkOwn,
            pkEnc : this.pk.pkEnc,
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
            _.get(userKey, "skEnc"),
            _.get(userKey, "skOwn"),
        );
    }

    static keyGen() {
        const mimc7 = new mimc.MiMC7();

        const sk_own = math.randomFieldElement(constants.SUBGROUP_ORDER).toString(16);
        const pk_own = mimc7.hash(
            sk_own, types.asciiToHex('pk_own') 
        )
        const sk_enc = mimc7.hash(
            sk_own, types.asciiToHex('sk_enc')
        )
        const userPublicKey = {
            ena : null,
            pkOwn : pk_own,
            pkEnc : Curve.basePointMul(types.hexToInt(sk_own)).toString(16)
        };
        // azerothFront code userPublicKey.pkEnc.toString(16)
        userPublicKey.ena =  mimc7.hash(userPublicKey.pkOwn, userPublicKey.pkEnc);

        return new UserKey(userPublicKey, sk_enc, sk_own);
    }

    static recoverFromUserSk(sk_own){
        const mimc7 = new mimc.MiMC7();

        // 왜 string -> bigint -> string으로 구현했을까
        const skBigInt = types.hexToInt(sk_own);
        const pk_own = mimc7.hash(
            sk_own, types.asciiToHex('pk_own') 
        )
        const sk_enc = mimc7.hash(
            sk_own, types.asciiToHex('sk_enc')
        )

        const userPublicKey = {
            ena : null,
            pkOwn : mimc7.hash(sk_own),
            pkEnc : Curve.basePointMul(skBigInt).toString(16)
        };

        // azerothFront code userPublicKey.pkEnc.toString(16)
        userPublicKey.ena =  mimc7.hash(userPublicKey.pkOwn, userPublicKey.pkEnc);

        return userPublicKey;
    }
}

// class UserKey {
//     constructor({ena, pkOwn, pkEnc}, sk){
//         this.pk = {
//             ena : ena,
//             pkOwn : pkOwn,
//             pkEnc : pkEnc
//         };
//         this.sk = sk;
//     }

//     toJson(){
//         return JSON.stringify({
//             ena   : this.pk.ena,
//             pkOwn : this.pk.pkOwn,
//             pkEnc : this.pk.pkEnc,
//             sk    : this.sk
//         });
//     }

//     pubKeyToJson(){
//         return JSON.stringify({
//             ena   : this.pk.ena,
//             pkOwn : this.pk.pkOwn,
//             pkEnc : this.pk.pkEnc,
//         });
//     }

//     static fromJson(userKeyJson) {
//         const userKey = JSON.parse(userKeyJson);
//         return new UserKey(
//             {
//                 ena     : _.get(userKey, "ena"),
//                 pkOwn   : _.get(userKey, "pkOwn"),
//                 pkEnc   : _.get(userKey, "pkEnc")
//             },
//             _.get(userKey, "sk")
//         );
//     }

//     static keyGen() {
//         const mimc7 = new mimc.MiMC7();

//         const sk = math.randomFieldElement(constants.SUBGROUP_ORDER);
//         const userPublicKey = {
//             ena : null,
//             pkOwn : mimc7.hash(sk.toString(16)),
//             pkEnc : Curve.basePointMul(sk).toString(16)
//         };
//         // azerothFront code userPublicKey.pkEnc.toString(16)
//         userPublicKey.ena =  mimc7.hash(userPublicKey.pkOwn, userPublicKey.pkEnc);

//         return new UserKey(userPublicKey, sk.toString(16));
//     }

//     static recoverFromUserSk(sk){
//         const mimc7 = new mimc.MiMC7();

//         // 왜 string -> bigint -> string으로 구현했을까
//         const skBigInt = types.hexToInt(sk);

//         const userPublicKey = {
//             ena : null,
//             pkOwn : mimc7.hash(skBigInt.toString(16)),
//             pkEnc : Curve.basePointMul(skBigInt).toString(16)
//         };

//         // azerothFront code userPublicKey.pkEnc.toString(16)
//         userPublicKey.ena =  mimc7.hash(userPublicKey.pkOwn, userPublicKey.pkEnc);

//         return userPublicKey;
//     }

//     static recoverFromIdPw(id, pw){

//         console.log("in")
//         const mimc7 = new mimc.MiMC7();
//         const sk = MakePrivKey(id, pw);
//         const userPubkey = this.recoverFromUserSk(sk);
//         console.log(JSON.stringify(userPubkey));
//         return new UserKey(userPubkey, sk);

//     }
// }

// export function recoverFromIdPw(id,pw){
//     console.log("in")
//         const sk = MakePrivKey(id, pw);
//         const userPubkey = UserKey.recoverFromUserSk(sk);
//         console.log(JSON.stringify(userPubkey));
//         return new UserKey(userPubkey, sk);
// }

// export function MakePrivKey(id, pw){
//     const mimc7 = new mimc.MiMC7();
//     const sk = mimc7.hash(types.asciiToHex(id).padEnd(32,0), types.asciiToHex(pw).padEnd(32, 0));
//     return sk;
// }