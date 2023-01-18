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
        inputs[2]
    ).send({
        from: `${EOA}`,
        gas: await ContractIns.methods.registUser(inputs[0],inputs[1],inputs[2]).estimateGas(),
        gasPrice: `${GasPrice}`
    })
    console.log("registUser : ", receipt);
}
