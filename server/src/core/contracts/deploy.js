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


export const ganacheKeys = JSON.parse(fs.readFileSync(ganacheAccountKeyPath, 'utf-8'));

export function compileContract() {

}

export async function ganacheDeploy() {
    const addr = (await web3Ins.eth.getAccounts())[0];
    const privKey = new Buffer.from(
        ganacheKeys.addresses[addr.toLocaleLowerCase()].secretKey.data, 'utf-8'
    ).toString('Hex')
    console.log('addr : ', addr);

    const receipt = await deploy(addr, privKey);
    ContractIns.options.address = receipt.contractAddress;

    setContractAddr(receipt.contractAddress);
    console.log(receipt, ContractIns.options.address);

    _.set(Config, 'ethAddr' , addr);
    _.set(Config, 'privKey' , '0x'+privKey);

    return receipt;
}

export async function deploy(
    fromAddr,
    privKey,
) {
    // const RegistDataTx = registDataContract.deploy({
    //     data: registDataContractJson.bytecode,
    //     arguments: [getContractFormatVk()]
    // })

    const deployTx = ContractIns.deploy({
        data : ContractJson.bytecode,
        arguments : [getContractFormatVk()]
    })

    // const createTransaction = await web3Ins.eth.accounts.signTransaction({
    //         from: `${fromAddr}`,
    //         data: RegistDataTx.encodeABI(),
    //         gas: await RegistDataTx.estimateGas(),
    //         gasPrice: '0x1'
    //     },
    //     `${privKey}`
    // );
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
    return createReceipt;
}
