import _ from 'lodash'
import Config from '../utils/config.js';
import {
    ContractIns,
    isDeployed,
    hexToDec
} from './utils.js'


export async function registUser(inputs, EOA, GasPrice) {
    if (!isDeployed()) {
        console.log('deploy first ');
        return false;
    }
    const receipt = await ContractIns.methods.registUser(
        inputs[0],
        inputs[1],
        inputs[2],
    ).send({
        from: `${EOA}`,
        gas: 110000,
        gasPrice: `${GasPrice}`
    })
    // await ContractIns.methods.registUser(inputs[0],inputs[1],inputs[2]).estimateGas()
    console.log("registUser : ", receipt);
    return receipt;
}

export async function registUserByDelegator(inputs, EOA, GasPrice){
    if (!isDeployed()) {
        console.log('deploy first ');
        return false;
    }
    const gasFee = await ContractIns.methods.registUserByDelegator(
        inputs[0],
        inputs[1],
        inputs[2],
        EOA
    ).estimateGas();

    const receipt = await ContractIns.methods.registUserByDelegator(
        inputs[0],
        inputs[1],
        inputs[2],
        EOA
    ).send({
        from: `${_.get(Config, 'ethAddr')}`,
        gas: gasFee,
        gasPrice: `${GasPrice}`,
    })
    // await ContractIns.methods.registUser(inputs[0],inputs[1],inputs[2]).estimateGas()
    console.log("registUser : ", receipt);
    return receipt;
}