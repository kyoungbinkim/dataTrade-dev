import types from '../../utils/types.js'
import Config from '../../utils/config.js';
import Encryption from '../../crypto/encryption.js';
import mimc from '../../crypto/mimc.js';
import math from '../../utils/math.js';
import CurveParam from '../../crypto/curveParam.js';
import FileSystem from '../../utils/file.js';
import { rawFileToBigIntString } from '../../utils/file.js';
import PublicKey from './pk.js';

class RegistData {
    #data   = null;
    #pk_own = null;
    #h_k    = null;
    #h_ct   = null;
    #id_data= null;
    #CT_data= null;
    #CT_r   = null;
    #dataEncKey = null;

    constructor(EC_TYPE=Config.EC_TYPE){ 
        this.curveParam = CurveParam(EC_TYPE);
    }

    uploadDataFromStr(str){
        const utf8buf = Buffer.from(str, 'utf-8');
        const hexStr = rawFileToBigIntString(utf8buf).padEnd(
            Config.textFileByteLen*2, "0"
        );
        this.uploadDataFromHexStr(hexStr);
    }

    uploadDataFromHexStr(hexStr){
        const hexStrPad = hexStr.padEnd(Config.dataBlockNum * CurveParam().blockBytes * 2, '0');
        this.uploadData(FileSystem.hexStringToBigIntArr(hexStrPad));
    }

    uploadData(data){
        try{
            this.#checkData(data)
        }
        catch(err){
            console.log(err.message);
            return;
        }
        this.#data = data;
    }

    uploadPkOwnFromPrivKey(privKey) {
        const mimc7 = new mimc.MiMC7();
        this.uploadPkOwn(mimc7.hash(privKey));
    }

    uploadPkOwn(pk_own) {
        console.log("pk_own : ", pk_own);
        if(types.isBigIntFormat(pk_own)){
            this.#pk_own = pk_own;
            return;
        }
        throw new Error("privKey format err");
    }

    uploadsCTdataAndEncKey(sCTdata, dataEncKey){
        this.#dataEncKey = dataEncKey.toString();
        this.#CT_r    = sCTdata.r;
        this.#CT_data = sCTdata.ct;
    }

    encryptData() {
        if(this.#CT_data != null || this.#CT_r != null){
            throw new Error("CT is already exsist");
        }
        const dataEncKey = types.decStrToHex( math.randomFieldElement(this.curveParam.prime));
        const symEnc = new Encryption.symmetricKeyEncryption(dataEncKey);
        const sCTdata = symEnc.EncData(this.#data);
        this.uploadsCTdataAndEncKey(sCTdata, dataEncKey);
    }

    makeSnarkInput(){
        if (
            this.#dataEncKey == null || 
            this.#CT_data == null || 
            this.#pk_own == null ||
            this.#data ==null
        ){ throw new Error("data is not prepared"); }
        const mimc7 = new mimc.MiMC7();
        this.#h_k    = mimc7.hash(this.#pk_own, this.#dataEncKey);
        this.#h_ct   = this.#hashArr(this.#CT_data);
        this.#id_data= this.#hashArr(this.#data);
    }

    getsCtData(){
        return new Encryption.sCTdata(this.#CT_r, this.#CT_data).toJson();
    }

    getEncKey(){
        return this.#dataEncKey;
    }

    gethCt(){
        return this.#h_ct;
    }
    
    getIdData(){
        return this.#id_data;
    }

    gethK(){
        return this.#h_k;
    }
    
    toSnarkInputFormat(){
        if( this.#dataEncKey == null || 
            this.#CT_data == null ||
            this.#pk_own == null ||
            this.#data ==null
        ){ throw new Error("param is not prepared"); }
        
        const snarkInput = {
            "pk_own"    : this.#pk_own,
            "h_k"       : this.#h_k,
            "h_ct"      : this.#h_ct,
            "id_data"   : this.#id_data,
            "dataEnckey": this.#dataEncKey,
            "data"      : {},
            "CT_data"   : {},
            "CT_r"      : this.#CT_r,
        };
        for(let i=0; i<Number(Config.dataMaxBlockNum); i++){
            snarkInput["data"][i]  = this.#data[i];
            snarkInput["CT_data"][i]= this.#CT_data[i];
        }
        // console.log(snarkInput);
        return JSON.stringify(snarkInput);
    }

    //pk_own, h_k, h_ct, id_data; 
    toSnarkVerifyFormat(){
        if(
            this.#pk_own == null ||
            this.#h_ct   == null ||
            this.#h_k    == null ||
            this.#id_data== null 
        ){ return null;}
        const verifySnarkInput = {
            "pk_own"    : this.#pk_own,
            "h_k"       : this.#h_k,
            "h_ct"      : this.#h_ct,
            "id_data"   : this.#id_data,
        };
        return JSON.stringify(verifySnarkInput);
    }

    #hashArr(arr){
        const mimc7 = new mimc.MiMC7();
        for(let i=0; i<arr.length; i++){
            mimc7.hashUpdate(arr[i]);
        }
        return mimc7.hashGetOuptut();
    }

    #checkData(data){
        const error = Error("data format Error");
        if (!Array.isArray(data)) {
            throw error;
        }
        if (data.length != Config.dataMaxBlockNum){
            throw error;
        }
        for(let i=0; i<Config.dataMaxBlockNum; i++){
            if(! types.isBigIntFormat(data[i])){
                throw error;
            }
        }
    }
}


/**
 r_cm 
 h_k 
 fee_del 
 fee_own 
 dataEncKey 
 pk_enc_cons 
 pk_own_del 
 pk_own_peer 
 r_enc 
 k_enc 
 */

 
class AcceptTrade{
    /**
     * 
     * @param {PublicKey} PublicKey_peer 
     * @param {PublicKey} PublicKey_del 
     * @param {PublicKey} PublicKey_cons 
     * @param {*} dataEncKey 
     * @param {*} r_cm 
     * @param {*} fee_own 
     * @param {*} fee_del 
     */
    constructor(
        pk_own_del,
        pk_own_peer,
        pk_enc_cons,
        dataEncKey,
        r_cm,
        fee_own,
        fee_del, 
    ){  
        const mimc7 = new mimc.MiMC7();
        const pubEnc= new Encryption.publicKeyEncryption();

        this.pk_enc_cons = pk_enc_cons
        this.pk_own_peer = pk_own_peer
        this.pk_own_del  = pk_own_del
        this.dataEncKey  = dataEncKey
        this.r_cm        = r_cm
        this.fee_del     = fee_del
        this.fee_own     = fee_own

        this.h_k         = mimc7.hash(
            this.pk_own_peer,
            this.dataEncKey
        )

        this.cm_own = mimc7.hash(pk_own_peer, r_cm, fee_own, this.h_k, pk_enc_cons);
        this.cm_del = mimc7.hash(pk_own_del, r_cm, fee_del, this.h_k, pk_enc_cons);

        const[pct, r, k] = pubEnc.Enc(
            {pkEnc : pk_enc_cons},
            dataEncKey
        )

        this.ecryptedDataEncKey = pct.toList();
        this.r_enc = r;
        this.k_enc = k;
    }

    toJson(){
        return JSON.stringify(this, null, 2)
    }
    
    toSnarkInputFormat(){
        return this.toJson();
    }

    toSnarkVerifyFormat() {
        return JSON.stringify({
            'cm_del' : this.cm_del,
            'cm_own' : this.cm_own,
            'ecryptedDataEncKey' : this.ecryptedDataEncKey
        }, null, 2)
    }
    
}

const SnarkInput = {
    RegistData,
    AcceptTrade
}

export default SnarkInput;