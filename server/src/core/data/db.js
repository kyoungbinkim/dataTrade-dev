import fs from 'fs';
import Encryption from '../crypto/encryption';
import Config from '../utils/config';
import { randomFieldElement } from '../utils/math';

export const dataDBpath = '/Users/kim/dataTrade-dev/server/db/';

class dataClass{
    #key = undefined;
    constructor(data){
        this.#key = randomFieldElement();
        this.data = [];
        if(Buffer.isBuffer(data)){
            const dataLen = data.length;
            for(let i=0; i<dataLen; i++){

            }
        }
    }

    static createDataClass(data){
        if(!Buffer.isBuffer(data)){
            return undefined;
        }
        return new dataClass(data);
    }

    encrypt(){
        if(!this.#key){return undefined;}
        const symEnc = Encryption.symmetricKeyEncryption(this.#key);
        const sCtData = symEnc.EncData(this.data);
    }
}

export function getDataDB(){
    const DB = JSON.parse(fs.readFileSync(dataDBpath, 'utf-8'));
    return DB;
}

export function saveDataDB(DBJson) {
    fs.writeFile(dataDBpath, JSON.stringify(DBJson), err => {
        if (err) {
            console.error(err);
        }
    });
}

function getCTlist(){
    const dataDB = JSON.parse(fs.readFileSync(dataDBpath, 'utf-8'));
    return dataDB["CT_list"];
}

function uploadData(){
    // const symEnc = Encryption.symmetricKeyEncryption
}

function uploadCT(h_ct, id, ctJson, desc=""){
    const dataDB = JSON.parse(fs.readFileSync(dataDBpath, 'utf-8'));
    dataDB[h_ct] = {
        "id" : id,
        "ct" : ctJson,
        "desc" : desc
    };
    fs.writeFile(dataDBpath, JSON.stringify(dataDB), err => {
        if (err) {
          console.error(err);
        }
    });
}

function getCTjson(h_ct){
    const dataDB = JSON.parse(fs.readFileSync(dataDBpath, 'utf-8'));
    return dataDB[h_ct]["ct"];
}

export function writesCTfile() {
    
}

const DBHandler = {
    dataDBpath,
    getDataDB,
    saveDataDB,

    getCTlist,
    uploadData,
    uploadCT,
    getCTjson
}
export default DBHandler;