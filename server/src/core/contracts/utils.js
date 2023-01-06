/* global BigInt */
import Config, {contractsBuildPath, fileStorePath} from "../utils/config.js";
import Web3 from 'web3';
import fs from 'fs';

export const web3Ins               = new Web3(Config.testProvider);
export const registDataContractJson= JSON.parse( fs.readFileSync(contractsBuildPath+'RegistDataContract.json', 'utf-8'));
export const registDataContract    = new web3Ins.eth.Contract(registDataContractJson.abi);
export let   contractAddr          = null;

export function getRegistDataContract(){
    return  registDataContract;
}

export function setContractAddr(addr){
    registDataContract.options.address = addr;
}

export function getVk(circuitName='RegistData'){
    return JSON.parse(
        fs.readFileSync(Config.homePath + 'src/core/libsnark/js-libsnark-opt/libsnark/' + circuitName + '_crs_vk.json', 'utf-8')
    );
}

export function getProof(hCt, circuitType){
    const proofJson = JSON.parse(
        fs.readFileSync(fileStorePath+circuitType+'_' + hCt + '_proof.json', 'utf-8')
    )
    return proofFlat(proofJson);
}

export function getPk(hCt ,circuitName='RegistData'){

}

export function getContractFormatVk(circuitName='RegistData'){
    const vkJson = getVk();
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
    getContractFormatVk
};

export default contractUtils;