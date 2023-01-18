import {
    ContractIns,
    hexToDec,
    isDeployed
} from "./utils.js";

// export function isDeployed() {
//     return ContractIns.options.address ? true : false;
// }

export function getContractAddr(){
    return ContractIns.options.address;
    
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

    const flag = await ContractIns.methods.isRegistered(h_ct).call();
    return flag
}

export async function isRegisteredData(h_ct){
    if (!isDeployed()) {
        console.log('deploy first ');
        return false;
    }
    try {
        const flag = await ContractIns.methods.isRegistered(h_ct).call();
        return flag
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function registDataContract(proof, inputs, fromAddr, GasPrice) {
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
    console.log(ContractIns.options.address);
    const gasFee = await ContractIns.methods.registData(proof, inputs).estimateGas();
    console.log("gasFee : ", gasFee);
    try {
        const receipt = await ContractIns.methods.registData(
            proof,
            inputs
        ).send({
            from: `${fromAddr}`,
            gas: gasFee,
            gasPrice: `${GasPrice}`
        })
        console.log(receipt);
        return receipt;
    } catch (error) {
        console.log(error);
        return undefined;
    }
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
