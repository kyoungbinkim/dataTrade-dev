/* global BigInt */
import fs from 'fs';
import config from './config.js';
import CurveParam from '../crypto/curveParam.js';
import Encryption from '../crypto/encryption.js';
import mimc from '../crypto/mimc.js';


class peerEncData{
    data = []
    constructor(privKey){
        const mimc7 = new mimc.MiMC7();
        this.pk_own = mimc7.hash(privKey);
        this.dataEncKey = privKey.toString();
        this.h_k = mimc7.hash(this.pk_own, this.dataEncKey);
    }

    uploadDataFromPath(dataPath){
        const RawData = readRawFile(dataPath);
        const dataLen = RawData.length;
        const dataBlockBytes = parseInt(CurveParam(config.EC_TYPE).primeLen / 8);
        const dataBlockNum =  parseInt(dataLen/dataBlockBytes)+ 1;
        let pad = (( dataBlockNum * dataBlockBytes - dataLen )).toString(16).padStart(2,'0');
        for(let i=0; i<config.dataMaxBlockNum; i++){
            if(i<dataBlockNum){
                let tmp = rawFileToBigIntString(RawData.slice(i*dataBlockBytes, (i+1)*dataBlockBytes)).padEnd(dataBlockBytes*2, pad);
                this.data.push(tmp);
            }
            else{
                this.data.push('0');
            }
        }
        console.log(this.data);
        BigIntArrToTextString(this.data);
    }

    uploadDataFromHexDataString(HexDataString){
        const strLen = HexDataString.length;
        const strBlockBytes = parseInt(CurveParam(config.EC_TYPE).primeLen / 8);
        const strBlockNum = parseInt(strLen/strBlockBytes)+ 1;
        let pad = (( strBlockNum * strBlockBytes - strLen )).toString(16).padStart(2,'0');
        for(let i=0; i<strBlockNum; i++){
            if(i<strBlockNum){
                let tmp = HexDataString.slice(i*strBlockBytes, (i+1)*strBlockBytes).padEnd(strBlockBytes*2, pad);
                this.data.push(tmp);
            }   
            else{
                this.data.push('0');
            }
        }
        BigIntArrToTextString(this.data);
    }

    encryptData(){
        const mimc7  = new mimc.MiMC7();
        const symEnc = new Encryption.symmetricKeyEncryption(this.dataEncKey);
        const strBlockBytes = parseInt(CurveParam(config.EC_TYPE).primeLen / 8);
        const CTdata = symEnc.EncData(this.data);
        this.CT_data = CTdata.ct;
        this.CT_r    = CTdata.r;
        for(let i=0 ; i<config.dataMaxBlockNum; i++){
            mimc7.hashUpdate(this.CT_data[i]);
        }
        this.h_ct    = mimc7.hashGetOuptut();
        for(let i=0 ; i<config.dataMaxBlockNum; i++){
            this.CT_data[i].padStart(strBlockBytes*2, '0');
            mimc7.hashUpdate(this.data[i]);
        }
        this.id_data = mimc7.hashGetOuptut().padStart(strBlockBytes*2, '0');
    }

    // to make Snark Input
    toJson() { return JSON.stringify(this); }
}


function BigIntArrToBuffer(BigIntDataArr){
    const strBlockBytes = parseInt(CurveParam(config.EC_TYPE).primeLen / 8);
    let strTmp ='';
    for(let i=0; i<config.dataMaxBlockNum; i++){
        if(BigIntDataArr[i]=== '0') break;
        strTmp += BigIntDataArr[i].padStart(strBlockBytes*2, '0');
    }
    //calc pad num
    const pad = Number('0x' + strTmp.slice(-2));

    // delete pad from data string
    strTmp = strTmp.slice(0, strTmp.length- 2*pad);
    
    const buf = Buffer.from(strTmp, 'hex');
    // console.log(buf);
    // fs.writeFileSync('./test.txt', buf);
    return buf;
}

function BigIntArrToTextString(BigIntDataArr){
    const buf = BigIntArrToBuffer(BigIntDataArr);
    // console.log(buf.toString());
    return buf.toString();
}

function readRawFile(filePath) {
    try{
        const data = fs.readFileSync(filePath);
        return data;
    }
    catch(e){
        console.log("while read raw file ",e);
    }
}

function readTextFile(filePath){
    if(!checkFileExtionsion(filePath, 'txt')){return null;}
    const data = fs.readFileSync(filePath, 'utf-8');
    return data;
}

function getFileExtension(filePath){
    const dotInd = filePath.lastIndexOf('.');
    const fileType = filePath.substring(dotInd + 1, filePath.length);
    console.log("file type : ", fileType);
    return fileType;
}

function checkFileExtionsion(filePath, extension){
    if (getFileExtension(filePath).toLowerCase() === extension.toLowerCase()){
        return true;
    }
    return false;
}


export function rawFileToBigIntString(rawData){
    let arr = []
    for(let i=0; i<rawData.length; i++){
        arr.push(rawData[i].toString(16).padStart(2,'0'));
    }
    
    return arr.join(''); // .padStart(CurveParam(config.EC_TYPE).blockBytes * 2, '0')
}

function readFileToBigIntString(filePath){
    const rawData = fs.readFileSync(filePath);
    let arr= [];
    for(let i=0, len=rawData.length; i<len; i++)
        arr.push(rawData[i].toString(16).padStart(2, '0'));
    return arr.join(''); //.padStart(CurveParam(config.EC_TYPE).blockBytes * 2, '0')
}

export function getByteLengthOfUtf8String(s) {
    let i,b,c;
	if(s != undefined && s != "") {
		for(b=i=0;c=s.charCodeAt(i++);b+=c>>11?3:c>>7?2:1);
		return b;
	} else {
		return 0;
	}
}


const FileSystem = {
    peerEncData,
    readRawFile,
    readTextFile,
    rawFileToBigIntString,
    readFileToBigIntString,
    BigIntArrToBuffer,
    BigIntArrToTextString,
    getByteLengthOfUtf8String,
};

export default FileSystem;