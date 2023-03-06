import DBinterface from "../db.interface";

export default class userDB extends DBinterface {
    constructor(){
        super();
        this.tableName = 'user'
    }

    /**
     * 
     * @param {String} type  'nickname' || 'id'
     * @param {String} value value String
     * @returns {boolean}
     */
    async duplicateCheck(
        type,
        value
    ) {
        try {
            const ret = this.SELECT(
                [type],
                this.tableName,
                {
                    'key' : type,
                    'value' : value
                }
            )
            return ret.length == 0;
        } catch (error) {
            console.log(error)
            return undefined
        }
    }

    /**
     * 
     * @param {*} type 
     * @param {*} value 
     */
    async getUserInfo(
        type, 
        value
    ) {
        try {
            const ret = this.SELECT(
                ['*'],
                this.tableName,
                {
                    'key' : type,
                    'value' : value
                }
            )
            return ret
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    async join(
        login_tk,
        nickname,
        sk_enc,
        pk_own,
        pk_enc,
        addr,
        EOA
    ){
        try {
            const ret = await this.INSERT(
                this.tableName,
                ['login_tk', 'nickname', 'sk_enc', 'pk_own', 'pk_enc', 'addr', 'eoa_addr'],
                [login_tk, nickname, sk_enc, pk_own, pk_enc, addr, EOA]
            )
            return true;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async login(
        login_tk
    ) {
        try {
            const ret = await this.SELECT(
                ['login_tk', 'nickname', 'sk_enc'],
                this.tableName,
                {
                    'key' : 'login_tk',
                    'value' : login_tk
                }
            )
        } catch (error) {
            console.log(error)
            return {flag : false}
        }
    }

}