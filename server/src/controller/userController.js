import _ from 'lodash';
import mimc from '../core/crypto/mimc.js';
import jwtHelper from '../core/crypto/jwt.js';
import JoinHelper from '../core/wallet/join.js';
import mySqlHandler from "../core/data/db.mysql";
import { registUser, registUserByDelegator } from '../core/contracts/join.js';
import { hexToDec } from './../core/contracts/utils.js';
import { getGanacheAccounts } from './../core/contracts/utils.js';
import {getTradeContract} from '../core/contracts/index.js';

let usrcnt = 1;

export const nicknameDeduplicateCheckController = async (req, res) => {
    console.log(req.params);
    const nickname = req.params.nickname;
    mySqlHandler.nicknameDuplicateCheckQuery(nickname, (err, flag) =>{
        if(err) {return res.status(200).send(flag);}
        res.status(200).send(flag);
    })
}

export const addressDeduplicateChcekController = async (req, res) => {
    console.log(req.params);
    const addr = req.params.address;
    mySqlHandler.duplicateCheckQuery('eoa_addr', addr, (err, flag) => {
        if(err) {return res.status(200).send(flag);}
        res.status(200).send(flag);
    })
}

export const joinController_backup = async (req, res) => {
    console.log(req.body);

    if(!JoinHelper.idLengthCheck(req.body["nickname"])){
        return res.status(400).send("id is too long");
    }

    mySqlHandler.userJoinQuery(req.body, async (ret) => {
        if(!ret){return res.status(200).send({flag:false});}
        const inputs = [
            hexToDec(req.body['addr']), 
            hexToDec(req.body['pkOwn']), 
            hexToDec(req.body['pkEnc'])
        ]
        try {
            const receipt = await registUser(inputs, req.body['EOA'], '0x1');
            res.status(200).send({
                flag: true,
                receipt : receipt
            });
        } catch (error) {
            console.log(error);
            res.status(200).send({flag: false});
        }
    })
}


export const joinController_new = async (req, res) => {
    const inputs = [
        hexToDec(req.body['addr']), 
        hexToDec(req.body['pkOwn']), 
        hexToDec(req.body['pkEnc'])
    ]
    const account = await getGanacheAccounts(usrcnt);

    try {
        const tradeContract = getTradeContract();
        const pk_own = hexToDec(req.body['pkOwn'])
        const pk_enc = hexToDec(req.body['pkEnc'])
        const receipt = await tradeContract.registUser(
            pk_own,
            pk_enc
        )
    } catch (error) {
        console.log(error);
        res.status(200).send({flag: false});
    }
}

export const joinController = async (req, res) => {
    console.log(req.body);

    if(!JoinHelper.idLengthCheck(req.body["nickname"])){
        return res.status(400).send("id is too long");
    }
    
    const account = await getGanacheAccounts(usrcnt);

    try {
        // const receipt = await registUserByDelegator(inputs, _.get(account, 'address'), '0x1');
        const tradeContract = getTradeContract();
        const pk_own = hexToDec(req.body['pkOwn'])
        const pk_enc = hexToDec(req.body['pkEnc'])
        const receipt = await tradeContract.registUser(
            pk_own,
            pk_enc,
            account.address
        )
        
        _.set(req.body, 'EOA', _.get(account, 'address'))
        _.set(req.body, 'receipt', receipt)

        mySqlHandler.userJoinQuery(req.body, async (ret) => {
            if(!ret){return res.status(200).send({flag:false});}
            
            usrcnt += 1;
            res.status(200).send({
                flag: true,
                account : account,
                receipt : receipt
            });
        })
    } catch (error) {
        console.log(error);
        res.status(200).send({flag: false});
    }    
}

export const loginController = async (req, res) => {
    mySqlHandler.userLoginQuery(req.body, (login) => {
        const response = {
          flag      : false,
          token     : undefined,
          loginTk   : undefined,
        };
        if(login.flag){
          response.flag     = true; 
          response.loginTk  = login.login_tk;
          response.token    = jwtHelper.sign({
            nickname : login.nickname,
            loginTk  : login.login_tk
          }, login.sk_enc)
        }
        res.status(200).send(response); 
      })
}