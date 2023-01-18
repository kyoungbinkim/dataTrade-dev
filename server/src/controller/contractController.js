import { 
    getContractProof,
    ContractIns,
    ContractJson,
    hexToDec
 } from '../core/contracts/utils';

export const getContractAbiController = (req, res) => {
    res.send(ContractJson.abi);
}

export const callIsRegisteredDataController = (req, res) => {
    const h_ct = req.param.h_ct;

    
}