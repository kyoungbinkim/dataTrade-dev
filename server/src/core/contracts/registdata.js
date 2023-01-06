import {
    registDataContract,
    getRegistDataContract,
    hexToDec
} from "./utils.js";

export function isDeployed() {
    return registDataContract.options.address ? true : false;
}

export function getContractAddr(){
    return registDataContract.options.address;
    
}

/**
 * 
 * @param {String} h_ct : hex String
 * @returns {boolean}
 */
export async function isRegistered(h_ct) {
    if (!isDeployed()) {
        console.log('deploy first ');
        return;
    }

    const flag = await registDataContract.methods.isRegistered(h_ct).call();
    return flag
}

export async function registData(proof, inputs, fromAddr, GasPrice) {
    if (!isDeployed()) {
        console.log('deploy first ');
        return false;
    }
    if (proof.length != 8) {
        console.log('invalid proof length');
        return false;
    }
    if (inputs.length != 5) {
        console.log('invalid inputs length');
        return false;
    }


    const receipt = await registDataContract.methods.registData(
        proof,
        inputs
    ).send({
        from: `${fromAddr}`,
        gas: `294814`,
        gasPrice: `${GasPrice}`
    })
    console.log(receipt);
}

export function registDataInputJsonToContractFormat(inputJson) {
    let tmp = ['1']
    tmp.push(hexToDec(inputJson['pk_own']));
    tmp.push(hexToDec(inputJson['h_k']));
    tmp.push(hexToDec(inputJson['h_ct']));
    tmp.push(hexToDec(inputJson['id_data']));
    const contractInput = tmp;

    return contractInput
}
