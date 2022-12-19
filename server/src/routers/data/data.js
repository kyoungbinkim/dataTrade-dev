import fs from 'fs'
import axios from 'axios'
import express from 'express';
import LibSnark, {snarkPath} from '../../core/libsnark/libsnark';
import SnarkInput from '../../core/libsnark/struct/snarkInput';
import FileSystem from '../../core/utils/file';
import DBHandler from '../../core/data/db';
import { dataDBpath } from '../../core/data/db';

const router = express.Router();
const libsnarkProver = new LibSnark("RegistData");
const libsnarkVerifier = new LibSnark("RegistData");

// return ctlist
router.get('/list', (req, res) => {
    res.send("dsfa");
});

router.post('/upload', async (req, res) => {
    const userId = req.body["id"];
    const data = req.body["data"];
    const key  = req.body["key"];
    const desc = req.body["desc"];

    const utf8buf = Buffer.from(data, 'utf-8');
    const hexStr = FileSystem.rawFileToHexString(utf8buf);
    
    const snarkInput = new SnarkInput.RegistData();
    snarkInput.uploadData(FileSystem.hexStringToBigIntArr(hexStr));
    snarkInput.uploadPkOwnFromPrivKey(key);
    snarkInput.encryptData();
    snarkInput.makeSnarkInput();

    const DB = DBHandler.getDataDB();
    DB["CT_list"].push(snarkInput.gethCt());
    DB[snarkInput.gethCt()] = {
        "id"        : userId,
        "key"       : key,
        "CT_data"   : snarkInput.getsCtData(),
        "desc"      : desc
    }
    // DBHandler.saveDataDB(DB);

    await libsnarkProver.uploadInputAndRunProof(snarkInput.toSnarkInputFormat(), "_"+snarkInput.gethCt());
    const proofJson = await libsnarkProver.getProofJson("_"+snarkInput.gethCt());
    const verifySnarkFormat = snarkInput.toSnarkVerifyFormat();

    console.log("proof\t\t: ",proofJson)
    console.log("verifySnark\t: ", verifySnarkFormat)

    res.status(200).send({
        proof       : proofJson,
        verifyInput : verifySnarkFormat
    });
});

export default router;