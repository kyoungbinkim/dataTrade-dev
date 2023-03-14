import _ from 'lodash'
import Encryption from '../core/crypto/encryption';
import {
    getDataInfoFromHct,
    getUserInfoFormNickname
} from "../core/data/db.mysql";
import { getTradeContract } from "../core/contracts";

const pubEnc = new Encryption.publicKeyEncryption(); 

export const genTradeController = async (req, res) => {
    try {
        // console.log(req)
        const h_ct = req.params.h_ct;
        const tx_hash = req.params.tx_hash;
        const dataInfo = (await getDataInfoFromHct(h_ct))[0];
        const usrInfo = await getUserInfoFormNickname(_.get(dataInfo, 'owner_nickname'));

        console.log("usrInfo", JSON.stringify(usrInfo, null, 2));

        const receipt = await getTradeContract().eth.getTransaction(tx_hash)
        console.log(receipt);

        const tmp = _.get(receipt, 'input').slice(10)
        for(let i=0; i<27; i++ ){
            console.log(i, tmp.slice(i*64, (i+1)*64),)
        }

        const dec_ct = decrypCT(
            _.get(receipt, 'input').slice(10),
            _.get(usrInfo, 'sk_enc')
        )

        console.log(dec_ct)
        // 2        : g^r
        // 3        : c1
        // 12 ~ 17  : CT
        res.send({
            flag: true
        })
    } catch (error) {
        console.log(error)
        res.send({
            flag : false
        })
    }
}

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

const sliceData = (data ,idx) =>{
    return data.slice(idx * 64 , (idx+1) * 64)
}