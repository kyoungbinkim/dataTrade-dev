import fs from 'fs'
import axios from 'axios'
import express from 'express';
import LibSnark from '../../core/libsnark/libsnark';
import SnarkInput from '../../core/libsnark/struct/snarkInput';
import FileSystem from '../../core/utils/file';
import DBHandler from '../../core/data/db';

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
            const verifySnarkFormat = snarkInput.toSnarkVerifyFormat();

            res.status(200).send({
                flag: true,
                proof: getProof(snarkInput.gethCt(), 'RegistData'),
                verifyInput: registDataInputJsonToContractFormat(
                    JSON.parse(verifySnarkFormat)
                ),
                ct_data     : JSON.parse(snarkInput.getsCtData()),
                dataEncKey  : '0x'+snarkInput.getEncKey(),
                contractAddr: getContractAddr(),
                contractAbi : registDataContractJson.abi,
            })
        } catch (error) {
            console.log(error);
            res.status(400).send({
                flag: false,
            })
        }

    })
})

router.post('/upload', (req, res) => {
    mySqlHandler.getUserInfoFromId(req.body["id"], (err, userInfo) => {
        if (err) {
            return res.status(400).send(err);
        }
        console.log("userInfo", userInfo);
        const usrId = userInfo['id'];
        const data = req.body['data'];
        const pkOwn = userInfo['pk_own'];
        const desc = req.body['desc'];

        const utf8buf = Buffer.from(data, 'utf-8');
        const hexStr = FileSystem.rawFileToHexString(utf8buf);

        const snarkInput = new SnarkInput.RegistData();
        snarkInput.uploadData(FileSystem.hexStringToBigIntArr(hexStr));
        // snarkInput.uploadPkOwnFromPrivKey(key);
        snarkInput.uploadPkOwn(pkOwn);
        snarkInput.encryptData();
        snarkInput.makeSnarkInput();

        libsnarkProver.uploadInputAndRunProof(snarkInput.toSnarkInputFormat(), "_" + snarkInput.gethCt());
        const proofJson = libsnarkProver.getProofJson("_" + snarkInput.gethCt());
        const verifySnarkFormat = snarkInput.toSnarkVerifyFormat();

        console.log("proof Json : ", proofJson);

        const fileJson = {
            userId: usrId,
            registDataProof: proofJson,
            pk_own: pkOwn,
            h_k: snarkInput.gethK(),
            h_ct: snarkInput.gethCt(),
            id_data: snarkInput.getIdData(),
            CT_data: snarkInput.getsCtData(),
        };

        const DBuploadJson = {
            id: usrId,
            title: req.body['title'],
            desc: req.body['desc'],
            h_data: snarkInput.getIdData(),
            enc_key: snarkInput.getEncKey(),
            filePath: fileStorePath + snarkInput.gethCt() + '.json'
        };

        mySqlHandler.registDataQuery(DBuploadJson, (flag) => {
            if (flag) {
                res.status(200).send({
                    flag: true,
                    proof: proofJson,
                    verifyInput: verifySnarkFormat
                })
                fs.writeFileSync(fileStorePath + snarkInput.gethCt() + '.json', JSON.stringify(fileJson));
            } else {
                res.status(400).send({
                    flag: false,
                    proof: null,
                    verifyInput: null
                })
            }
        })

    })
});

export default router;