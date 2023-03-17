import math from '../../utils/math';
import mimc from "../../crypto/mimc";

export default class CoinCommitment {
    constructor(
        cm_own = undefined,
        cm_del = undefined
    ) {
        this.cm_own = cm_own
        this.cm_del = cm_del
    }

    static makeCm({
        pk_own_peer,
        pk_own_del,
        pk_enc_cons,
        r_cm,
        fee_own,
        fee_del,
        h_k
    }) {
        // console.log(
        //     '\n\n makeCm : \n',
        //     pk_own_peer,'\n',
        //     pk_own_del,'\n',
        //     pk_enc_cons,'\n',
        //     r_cm,'\n',
        //     fee_own,'\n',
        //     fee_del,'\n',
        //     h_k,'\n',
        // )
        const mimc7 = new mimc.MiMC7();

        console.log(
            "\n\npk_own_peer : ",  pk_own_peer, '\n',
            'r_cm : ' ,         r_cm ,'\n',
            'fee_own : ' ,      fee_own ,'\n',
            'h_k : ' ,          h_k ,'\n',
            'pk_enc_cons : ' ,  pk_enc_cons ,'\n',
        )  
        const cm_own = mimc7.hash(pk_own_peer, r_cm, fee_own, h_k, pk_enc_cons);
        console.log(
            'mimc7 cm_own Test : \n',
            mimc7.hash(pk_own_peer, r_cm, fee_own, h_k),'\n',
            mimc7.hash(pk_own_peer, r_cm, fee_own),'\n',
            mimc7.hash(pk_own_peer, r_cm),'\n',
            mimc7.hash(pk_own_peer),'\n',
            mimc7.hash(pk_own_peer, r_cm, fee_own, h_k, pk_enc_cons),'\n',
        )
        const cm_del = mimc7.hash(pk_own_del, r_cm, fee_del, h_k, pk_enc_cons);

        return new CoinCommitment(cm_own, cm_del);
    }

    static genCm(
        pk_own_peer,
        pk_own_del,
        pk_enc_cons,
        fee_own, 
        fee_del, 
        h_k, 
    ) {
        const randomHex = math.randomFieldElement()
        return [
            this.makeCm({
            pk_own_peer : pk_own_peer,
            pk_own_del  : pk_own_del,
            pk_enc_cons : pk_enc_cons,
            r_cm        : randomHex.toString(16),
            fee_own     : fee_own, 
            fee_del     : fee_del, 
            h_k         : h_k, 
        }), randomHex.toString(16)];
    }

    toJson(){
        return JSON.stringify(this, null, 2);
    }
}