/* global BigInt */
import Config, {contractsBuildPath, crsPath, fileStorePath} from "../utils/config.js";
import { ganacheKeys } from "./deploy.js";
import Web3 from 'web3';
import fs from 'fs';

export const web3Ins               = new Web3();
web3Ins.setProvider(new Web3.providers.HttpProvider(Config.testProvider));

export const ContractJson    = JSON.parse(fs.readFileSync(contractsBuildPath+'dataTradeContract.json', 'utf-8'))
export const ContractIns     = new web3Ins.eth.Contract(ContractJson.abi);

export function setContractAddr(addr){
    ContractIns.options.address = addr
}

export function getContractAddr(){
    return ContractIns.options.address;
}

export async function getGanacheAccounts(cnt=1){
    const addr = (await web3Ins.eth.getAccounts())[cnt];
    const privKey = new Buffer.from(
        ganacheKeys.addresses[addr.toLocaleLowerCase()].secretKey.data, 'utf-8'
    ).toString('Hex')
    return {
        address : addr,
        privKey : privKey
    }
}

export async function signTx(rawTx, privKey=Config.privKey){
    try {
        const signedTx =  await web3Ins.eth.accounts.signTransaction(rawTx, privKey);
        return signedTx
    } catch (error) {
        console.log(error);
        return;
    }
}

export async function sendSignedTransaction(signedTx){
    try {
        if(signedTx.rawTransaction === undefined){
            return;
        }
        const receipt = await web3Ins.eth.accounts.sendSignedTransaction(signedTx)
        return receipt;
    } catch (error) {
        console.log(error)
        return;
    }
}

export async function getAllAddr() {
    return ( await web3Ins.eth.getAccounts() );
}

export function getVk(circuitName='RegistData'){
    return JSON.parse(
        fs.readFileSync(crsPath + circuitName + '_crs_vk.json', 'utf-8')
    );
}

export function getProof(hCt, circuitType){
    const proofJson = JSON.parse(
        fs.readFileSync(fileStorePath+circuitType+'_' + hCt + '_proof.json', 'utf-8')
    )
    return proofFlat(proofJson);
}

export function getContractProof(proofId, circuitType){
    const proofJson = JSON.parse(
        fs.readFileSync(fileStorePath+circuitType+'_' + proofId + '_proof.json', 'utf-8')
    )
    return proofFlat(proofJson);
}


export function getContractFormatVk(circuitName='RegistData'){
    const vkJson = getVk(circuitName);
    let tmp = [];
    for (let i = 0; i < 2; i++) {
      tmp.push(hexToDec(vkJson['alpha'][i]))
    }
    
    // reversed
    for (let i = 0; i < 4; i++) {
      tmp.push(hexToDec(vkJson['beta'][Number.parseInt(i / 2)][(i+1) % 2]))
    }
    
    // reversed
    for (let i = 0; i < 4; i++) {
      tmp.push(hexToDec(vkJson['delta'][Number.parseInt(i / 2)][(i+1) % 2]))
    }
    
    // console.log("ABC len : ", vkJson['ABC'].length)
    for (let i = 0; i < vkJson['ABC'].length*2; i++) {
      tmp.push(hexToDec(vkJson['ABC'][Number.parseInt(i / 2)][i % 2]))
    }
    const vk = tmp;
    console.log(circuitName, 'vk len : ', vk.length);
    return vk;
}



/**
 * 
 * @param {String} hexStr 
 * @returns {String}  hex to Dec
 * 
 */
export function hexToDec(hexStr) {
    if (hexStr.slice(0, 2) !== '0x') {
        return BigInt('0x' + hexStr).toString();
    }
    return BigInt(hexStr).toString();
}

/**
 * 
 * @param {JSON} proofJson 
 * @returns {Array}
 * 
 */
export function proofFlat(proofJson) {
    let tmp = []
    try{
        for (let i = 0; i < 2; i++) {
            tmp.push(hexToDec(proofJson['a'][i]));
        }
        for (let i = 0; i < 4; i++) {
            tmp.push(hexToDec(proofJson['b'][Number.parseInt(i / 2)][(i + 1) % 2]));
        }
        for (let i = 0; i < 2; i++) {
            tmp.push(hexToDec(proofJson['c'][i]));
        }
        return tmp;
    }
    catch(err){
        console.log(err.message);
        return null;
    } 
}

const contractUtils = {
    hexToDec,
    proofFlat,
    getContractFormatVk,
};

export default contractUtils;