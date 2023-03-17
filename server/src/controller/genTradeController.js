import _ from 'lodash'
import fs from 'fs'
import mimc from '../core/crypto/mimc';
import Config from '../core/utils/config';
import Encryption from '../core/crypto/encryption';
import {
    getDataEncKeyFromHct,
    getDataInfoFromHct,
    getUserInfoFormNickname
} from "../core/data/db.mysql";
import { getTradeContract } from "../core/contracts";
import SnarkInput from '../core/libsnark/struct/snarkInput';
import LibSnark from '../core/libsnark/libsnark';
import { getContractProof } from '../core/contracts/utils';
import { acceptTradeInputJsonToContractFormat } from '../core/contracts/contract';


const pubEnc = new Encryption.publicKeyEncryption(); 

const libsnarkProver = new LibSnark("AcceptTrade");

export const genTradeController = async (req, res) => {
    try {
        // console.log(req)
        const h_ct = req.params.h_ct;
        const tx_hash = req.params.tx_hash;
        const dataInfo = (await getDataInfoFromHct(h_ct))[0];
        const usrInfo = await getUserInfoFormNickname(_.get(dataInfo, 'owner_nickname'));

        console.log("usrInfo : ", JSON.stringify(usrInfo, null, 2));
        console.log('dataInfo : ', JSON.stringify(dataInfo, null, 2));

        const receipt = await getTradeContract().eth.getTransaction(tx_hash)
        console.log(receipt);

        const data = _.get(receipt, 'input').slice(10)
        for(let i=0; i<27; i++ ){
            console.log(i, data.slice(i*64, (i+1)*64),)
        }

        /*
        pk_enc_cons,
        pk_own_cons,
        r_cm,
        fee_own
        fee_del
        h_k
        */
        const dec_ct = decrypCT(
            _.get(receipt, 'input').slice(10),
            _.get(usrInfo, 'sk_enc')
        )
        // console.log(dec_ct)

        if(!checkCM(data, dec_ct, _.get(usrInfo, 'pk_own'), _.get(Config.keys, 'pk_own'))){
            return res.send({
                flag : false
            })
        }
        
        const keyJson = await getDataEncKeyFromHct(h_ct)
        console.log(keyJson)

        const enc_key   = _.get(keyJson, 'enc_key')
        const data_path = _.get(keyJson, 'data_path')

        const symEnc = new Encryption.symmetricKeyEncryption(enc_key)
        const CT = _.get(JSON.parse(fs.readFileSync(data_path, 'utf-8')), 'ct_data');
        // console.log(JSON.stringify(CT, null, 2))
        
        const dec = symEnc.DecData(new Encryption.sCTdata(
            _.get(CT, 'r'),
            _.get(CT, 'ct')
        ));

        // console.log(dec)
        const dataString = hexStrToString(dec)

        acceptTrade(
            _.get(Config.keys, 'pk_own'),
            _.get(usrInfo, 'pk_own'),
            dec_ct[0],
            enc_key,
            dec_ct[2],
            dec_ct[3],
            dec_ct[4]
        )

        res.send({
            flag    : true,
            owner   : _.get(usrInfo, 'nickname'),
            title   : _.get(dataInfo, 'title'),
            key     : enc_key,
            h_ct    : h_ct,
            data    : dataString
        })
    } catch (error) {
        console.log(error)
        res.send({
            flag : false
        })
    }
}

// 2        : g^r
// 3        : c1
// 12 ~ 17  : CT
const decrypCT = (data, sk_enc_peer) => {
    const c0 = sliceData(data, 2)
    const c1 = sliceData(data, 3)

    let c2 = []
    for (let i=12; i<18; i++){
        c2.push(sliceData(data, i))
    }

    return pubEnc.Dec(
        new Encryption.pCT(c0, c1, c2),
        sk_enc_peer
    )
}

// 4        : cm_own = Hash(pk_own_peer || r || fee_peer || h_k || pk_enc_cons)
// 5        : cm_del = Hash(pk_own_del  || r || fee_del  || h_k || pk_enc_cons)
const checkCM = (data, decCT, pk_own_peer, pk_own_del) =>{

    const mimc7 = new mimc.MiMC7();

    const cm_own = sliceData(data, 4)
    const cm_del = sliceData(data, 5)

    const [ 
        pk_enc_cons, 
        pk_own_cons,
        r_cm,
        fee_own,
        fee_del,
        h_k ] = decCT

    console.log(
        " pk_own_peer : ",  pk_own_peer, '\n',
        'r_cm : ' ,         r_cm ,'\n',
        'fee_own : ' ,      fee_own ,'\n',
        'h_k : ' ,          h_k ,'\n',
        'pk_enc_cons : ' ,  pk_enc_cons ,'\n',
    )   

    const cm_own_calc = mimc7.hash(
        pk_own_peer,
        r_cm,
        fee_own,
        h_k,
        pk_enc_cons
    )
    const cm_del_calc = mimc7.hash(
        pk_own_del,
        r_cm,
        fee_del.padStart(64, '0'),
        h_k,
        pk_enc_cons
    )

    console.log(cm_own_calc,cm_own )
    console.log(cm_del_calc, cm_del)

    return cm_own_calc.padStart(64, '0') === cm_own.padStart(64, '0') &&  cm_del_calc.padStart(64, '0')===cm_del.padStart(64, '0')
}

const sliceData = (data ,idx) =>{
    if(typeof data !== 'string') {throw Error('data must be string')}
    return data.slice(idx * 64 , (idx+1) * 64)
}

/**
 * 
 * @param {Array<String>} strArr 
 * @returns {string} readable data string
 */
const hexStrToString = (strArr) => {
    let ret = ''
    for (let i =0; i<Number(Config.dataBlockNum); i++){
        if(strArr[i] === '0') continue;
        console.log(strArr[i]);
        ret += Buffer.from(strArr[i].padStart(64,'0'), 'hex')
    }

    console.log(ret, typeof ret)
    return ret
}

const acceptTrade = async (
    pk_own_del,
    pk_own_peer,
    pk_enc_cons,
    dataEncKey,
    r_cm,
    fee_own,
    fee_del,
) => {
    try {
        const snarkInput = new SnarkInput.AcceptTrade(
            pk_own_del,
            pk_own_peer,
            pk_enc_cons,
            dataEncKey,
            r_cm,
            fee_own,
            fee_del
        )
    
        libsnarkProver.uploadInputAndRunProof(
            snarkInput.toSnarkInputFormat(),
            '_' + r_cm
        )
    
        const contractInput = acceptTradeInputJsonToContractFormat(
            JSON.parse(snarkInput.toSnarkVerifyFormat())
        )
        const contractProof = getContractProof(r_cm, `AcceptTrade`)
        
        // console.log('\n Accept Trade : \n', contractInput, '\n', contractProof )


        const receipt = await getTradeContract().acceptTrade(
            contractProof,
            contractInput,
        )
        console.log(receipt)
    } catch (error) {
        console.log(error)
        return false
    }
    
}