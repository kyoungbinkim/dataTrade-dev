import Web3 from 'web3';
import fs from 'fs';
import child_process from 'child_process';
import web3Contract from 'web3-eth-contract';
import Config, {
    contractsBuildPath,
    ganacheAccountKeyPath
} from '../utils/config.js';
import {
    getContractFormatVk,
    web3Ins,
    registDataContractJson,
    registDataContract
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
    console.log(receipt)
    return receipt;
}

export async function deploy(
    fromAddr,
    privKey,
    contractName = 'RegistDataContract'
) {
    const RegistDataTx = registDataContract.deploy({
        data: registDataContractJson.bytecode,
        arguments: [getContractFormatVk()]
    })
    // console.log(contractJson.abi)
    // console.log(RegistDataTx.encodeABI(), await RegistDataTx.estimateGas())

    const createTransaction = await web3Ins.eth.accounts.signTransaction({
            from: `${fromAddr}`,
            data: RegistDataTx.encodeABI(),
            gas: await RegistDataTx.estimateGas(),
            gasPrice: '0x1'
        },
        `${privKey}`
    );

    const createReceipt = await web3Ins.eth.sendSignedTransaction(createTransaction.rawTransaction);
    console.log(`Contract deployed at address: ${createReceipt.contractAddress}`);
    
    // set Contrat Address
    registDataContract.options.address = createReceipt.contractAddress;

    return createReceipt;
}
