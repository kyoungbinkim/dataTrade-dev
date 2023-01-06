import fs from 'fs'
import axios from 'axios'
import express from 'express';
import LibSnark from '../../core/libsnark/libsnark';
import SnarkInput from '../../core/libsnark/struct/snarkInput';
import FileSystem from '../../core/utils/file';
import { isRegistered } from '../../core/contracts/registdata';
import { registDataContract, hexToDec } from '../../core/contracts/utils';

import {
    fileStorePath,
    mysqlConfig,
    snarkPath
} from '../../core/utils/config';

import {
    registDataInputJsonToContractFormat,
    getContractAddr
} from '../../core/contracts/registdata';

import { 
    getProof,
    registDataContractJson
 } from '../../core/contracts/utils';
import mySqlHandler from '../../core/data/db.mysql';

const router = express.Router();
const libsnarkProver = new LibSnark("RegistData");
// const libsnarkVerifier = new LibSnark("RegistData");

// return ctlist
router.get('/list', (req, res) => {
    res.send("dsfa");
});

router.post('/getProof', (req, res) => {
    mySqlHandler.getUserInfoFromId(req.body["id"], (err, userInfo) => {
        if (err) {
            return res.status(400).send(err);
        }
        try {
            const data = req.body['data'];
            const pkOwn = userInfo['pk_own'];

            const utf8buf = Buffer.from(data, 'utf-8');
            const hexStr = FileSystem.rawFileToHexString(utf8buf);

            const snarkInput = new SnarkInput.RegistData();

            //upload hex string data
            snarkInput.uploadData(FileSystem.hexStringToBigIntArr(hexStr));

            // upload pk_own 
            snarkInput.uploadPkOwn(pkOwn);

            // encrypt data to make ct_data
            snarkInput.encryptData();

            // make h_k h_data id_data
            snarkInput.makeSnarkInput();

            // make proof and vk
            libsnarkProver.uploadInputAndRunProof(snarkInput.toSnarkInputFormat(), "_" + snarkInput.gethCt());
            const proofJson = libsnarkProver.getProofJson("_" + snarkInput.gethCt());
            const verifySnarkFormat = JSON.parse(snarkInput.toSnarkVerifyFormat());

            res.status(200).send({
                flag: true,
                proof: getProof(snarkInput.gethCt(), 'RegistData'),
                verifyInput: registDataInputJsonToContractFormat(
                    verifySnarkFormat
                ),
                ct_data     : JSON.parse(snarkInput.getsCtData()),
                dataEncKey  : '0x'+snarkInput.getEncKey(),
                contractAddr: getContractAddr(),
                contractAbi : registDataContractJson.abi,
                id_data     : verifySnarkFormat['id_data'],
                h_ct        : verifySnarkFormat['h_ct'],
            })
        } catch (error) {
            console.log(error);
            res.status(400).send({
                flag: false,
            })
        }

    })
})


/**
 * post 필요한 데이터  title, decs  id, ct_data, dataEncKey, h_id, h_ct
 */
router.post('/upload', (req, res) => {
    console.log("!!", registDataContract.options.address);
    if(!isRegistered(hexToDec(req.body['h_ct']))){
        res.status(400).send({
            flag : false
        })
        return;
    } 

    mySqlHandler.getUserInfoFromId(req.body["id"], (err, userInfo) => {
        let uploadData = req.body;
        uploadData.pk_own = userInfo['pk_own'];
        uploadData.pk_enc = userInfo['pk_enc'];
        uploadData.enc_data_path = fileStorePath + uploadData['h_ct'] + '.json';

        console.log(uploadData);
        mySqlHandler.registDataQuery(uploadData, (flag) => {
            try {
                if (flag) {
                    res.status(200).send({
                        'flag': true,
                    })
                    fs.writeFileSync(fileStorePath + uploadData['h_ct'] + '.json', JSON.stringify(uploadData, null, 2));
                } else {
                    res.status(400).send({
                        'flag': false
                    })
                }
            } catch (error) {
                console.log(error);
                res.status(400).send({
                    'flag': false
                })
            }
            
        })
    })
})

router.get('/page/:ind', (req, res) => {
    mySqlHandler.getDataList(ind, (err, ret) => {
        console.log(ret);
        res.send(ret);
    })
})


router.get('/page', (req, res) => {
    mySqlHandler.getAllDataList((err, ret) => {
        console.log(ret);
        res.send(ret);
    })
})

export default router;