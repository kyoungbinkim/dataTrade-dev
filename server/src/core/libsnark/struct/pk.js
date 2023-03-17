import UserKey from "../../wallet/keyStruct.js"

export default class PublicKey{
    type   = undefined
    pk_enc = undefined
    pk_own = undefined

    /**
     * 
     * @param {String} pk_own 
     * @param {String} pk_enc 
     * @param {Strinf} type 'own' || 'peer' || 'cons'
     * @returns 
     */
    constructor(pk_own='', pk_enc='', type=''){
        if(!(type === 'del' || type === 'peer' || type === 'cons')){return}
        this.type = type
        this.pk_enc = pk_enc
        this.pk_own = pk_own
    }

    /**
     * 
     * @param {UserKey} userKey 
     * @param {string} type 
     * @returns 
     */
    static fromUserKey(userKey, type){
        if(!(type === 'del' || type === 'peer' || type === 'cons')){return undefined;}

        return new PublicKey(userKey.pk.pkOwn, userKey.pk.pkEnc, type)
    }

    toJson() {
        const pk_own_type = `pk_own_${this.type}`
        const pk_enc_type = `pk_enc_${this.type}`
        let pk = {}
        pk[pk_own_type] = this.pk_own
        pk[pk_enc_type] = this.pk_enc

        return JSON.stringify(pk, null, 2)
    }
}