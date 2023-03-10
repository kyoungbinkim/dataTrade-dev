import _ from 'lodash';
import fs from 'fs';
import { 
    getUserInfo,
    registDataQuery,
} from "../core/data/db.mysql.js";
import SnarkInput from "../core/libsnark/struct/snarkInput.js";
import FileSystem from "../core/utils/file.js";
import LibSnark from "../core/libsnark/libsnark.js";
import {
    getContractProof,
    getContractAddr,
} from "../core/contracts/utils.js"
import { fileStorePath } from '../core/utils/config.js';
import { getTradeContract } from '../core/contracts/index.js';
import { registDataInputJsonToContractFormat } from '../core/contracts/contract.js';

const libsnarkProver = new LibSnark("RegistData");

const dataToHexStr = (data) => {
    const utf8buf = Buffer.from(data, 'utf-8');
    const hexStr  =  FileSystem.rawFileToHexString(utf8buf);

    return hexStr;
}


export const registDataController = async (req, res) => {
    const loginTk  = getLoginTk(req);

    console.log("loginTk : ",loginTk);
    const usrInfo = await getUserInfo(loginTk);
    console.log(usrInfo);
    const addr       = usrInfo['eoa_addr'];
    const data       = req.body['data'];
    const pkOwn      = usrInfo['pk_own'];

    const snarkInput = new SnarkInput.RegistData();
    
    // upload data 
    snarkInput.uploadDataFromStr(data);

    // upload pk_own 
    snarkInput.uploadPkOwn(pkOwn);

    // encrypt data to make ct_data
    snarkInput.encryptData();

    // make h_k h_data id_data
    snarkInput.makeSnarkInput();

    libsnarkProver.uploadInputAndRunProof(snarkInput.toSnarkInputFormat(), "_" + snarkInput.gethCt());
    const verifySnarkFormat = JSON.parse(snarkInput.toSnarkVerifyFormat());

    const contractVerifyInput = registDataInputJsonToContractFormat(verifySnarkFormat);
    const contractProof       = getContractProof(snarkInput.gethCt(), `RegistData`);
    
    // send regist data contract
    console.log("proof", contractProof);
    console.log("verify input", contractVerifyInput);

    const receipt = await getTradeContract().registData(
        contractProof,
        contractVerifyInput,
    )

    if(!(await getTradeContract().isRegisteredData(contractVerifyInput[3]))){
        return res.send(false);
    }

    const registerDataJson =  _.merge(
        {
            "ct_data" : JSON.parse(snarkInput.getsCtData()),
            'enc_key' : snarkInput.getEncKey(),
            'h_ct'  : snarkInput.gethCt(),
            'h_data'  : snarkInput.getIdData(),
            'data_path' : fileStorePath + snarkInput.gethCt() + '.json',
            'h_k'   : snarkInput.gethK(),
        }, 
        usrInfo, req.body)
    
    console.log(registerDataJson);    
    if(await registDataQuery(registerDataJson)){
        try {
            fs.writeFileSync(
                registerDataJson['data_path'],
                JSON.stringify(registerDataJson, null, 2)
            )
            return res.send(
                {
                    flag        : true,
                    receipt     : receipt,
                    h_ct        : snarkInput.gethCt(),
                    proof       : contractProof,
                    contractAddr: getContractAddr(),
                }
            );
        } catch (error) {
            console.log(error);
        }
    }

    res.send(false);
}

export const getLoginTk = (req) => {
    const jwtHeader = JSON.parse(req.headers['access-token'] || req.query.token)
    const lgTk = jwtHeader.loginTk;
    return lgTk;
}