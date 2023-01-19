import { 
    getContractProof,
    ContractIns,
    ContractJson,
    hexToDec
} from '../core/contracts/utils';

import { 
    isRegisteredData 
} from '../core/contracts/registdata';

export const getContractAbiController = (req, res) => {
    res.send(ContractJson.abi);
}

export const callIsRegisteredDataController = async (req, res) => {
    const h_ct = req.param.h_ct;

    const flag = await isRegisteredData(h_ct);

    res.send(flag);
}