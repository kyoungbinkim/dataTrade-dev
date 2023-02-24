import { 
    getContractProof,
    ContractIns,
    ContractJson,
    hexToDec,
    getAllAddr
} from '../core/contracts/utils';
import { getTradeContract } from '../core/contracts';

export const getContractAbiController = (req, res) => {
    res.send(getTradeContract().contractAbi);
}

export const getContractAddressController = (req, res) =>{
    res.send(getTradeContract().contractAddress)
}

export const getContractInfoController = (req, res) => {
    const contractInfo = {
        abi : getTradeContract().contractAbi,
        addr: getTradeContract().contractAddress
    }
    console.log(contractInfo)
    res.send(
        contractInfo
    )
}

export const callIsRegisteredDataController = async (req, res) => {
    const h_ct = req.param.h_ct;

    const flag = await getTradeContract().isRegisteredData(h_ct);

    res.send(flag);
}

export const getAllAddressController = async (req, res) => {
    res.send(await getTradeContract().getAllAddr());
}