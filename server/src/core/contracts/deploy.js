import _ from 'lodash'
import Web3 from 'web3';
import fs from 'fs';
import Config, {
    contractsBuildPath,
    ganacheAccountKeyPath
} from '../utils/config.js';
import {
    getContractFormatVk,
    web3Ins,
    ContractIns,
    ContractJson,
    setContractAddr
} from './utils.js'
import { initTradeContract } from './index.js';


export const ganacheKeys = JSON.parse(fs.readFileSync(ganacheAccountKeyPath, 'utf-8'));

export async function ganacheDeploy() {
    const addr = (await web3Ins.eth.getAccounts())[0];
    const privKey = new Buffer.from(
        ganacheKeys.addresses[addr.toLocaleLowerCase()].secretKey.data, 'utf-8'
    ).toString('Hex')

    const receipt = await deploy(addr, privKey);

    setContractAddr(receipt.contractAddress);
    
    _.set(Config, 'contractAddress', receipt.contractAddress);
    _.set(Config, 'ethAddr' , addr);
    _.set(Config, 'privKey' , '0x'+privKey);

    initTradeContract();
    
    return receipt;
}

/**
 * 
 * @param {String} fromAddr  :  deployer addr
 * @param {String} privKey   :  deployer priv Key
 * @returns 
 */
export async function deploy(
    fromAddr,
    privKey,
) {

    const deployTx = ContractIns.deploy({
        data : ContractJson.bytecode,
        arguments : [getContractFormatVk()]
    })

    const createTransaction = await web3Ins.eth.accounts.signTransaction({
        from    : `${fromAddr}`,
        data    : deployTx.encodeABI(),
        gas     : await deployTx.estimateGas(),
        gasPrice: '0x1'
    },
    `${privKey}`
    );

    const createReceipt = await web3Ins.eth.sendSignedTransaction(createTransaction.rawTransaction);
    console.log(`Contract deployed at address: ${createReceipt.contractAddress}`);
    
    // set Contrat Address
    ContractIns.options.address = createReceipt.contractAddress;
    console.log(createReceipt);
    return createReceipt;
}
