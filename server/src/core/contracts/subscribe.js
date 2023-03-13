import _ from 'lodash';
import Config from '../utils/config';
import Encryption from '../crypto/encryption';
import {
    getTradeContract
} from './index';
import { getUserKeysFromAddr } from '../data/db.mysql';

const pubEnc = new Encryption.publicKeyEncryption();

const subscribeGenTrade =  () => {
    try {
        return getTradeContract().eth.subscribe(
            'logs', 
            {
                address: _.get(Config, 'contractAddress')
            }, 
            async (err, log) => {
                if (err) {
                    console.log(err);
                    return;
                }

                console.log("subscribe : ", log)
                let data = _.get(log, 'data');
                if (data.slice(0,2) === '0x') { data = data.slice(2)}

                console.log(data.length) 
                for (let i=0; i<11; i++) {
                    console.log(i, data.slice(i*64, (i+1)*64), data.slice(i*64, (i+1)*64).length)
                }
                
                const peerKeys = await getUserKeysFromAddr(data.slice(0, 64))

                const c0 = data.slice(64, 128)
                const c1 = data.slice(128,192)



                let c2 = [];
                for (let i=5; i<11; i++){
                    c2.push(data.slice(i*64, (i+1)*64))
                }
                // TODO :  Accept Trade
                const dec = pubEnc.Dec(
                    new Encryption.pCT(c0, c1,c2),
                    _.get(peerKeys, 'sk_enc')
                )
                console.log(dec);

            }
        )
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export default subscribeGenTrade;