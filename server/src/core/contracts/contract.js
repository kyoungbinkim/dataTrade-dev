import Web3Interface from "./web3.interface";
import Web3 from "web3";
import Config, { contractsBuildPath, fileStorePath } from "../utils/config";
import _ from 'lodash'
import fs from 'fs'


export const ContractJson    = JSON.parse(fs.readFileSync(contractsBuildPath+'dataTradeContract.json', 'utf-8'))

export default class contract extends Web3Interface {

    constructor(endPoint, contractAddr){
        super(endPoint);
        this.instance = new this.eth.Contract(ContractJson.abi, contractAddr);
        this.contractMethod = this.instance.methods;
        this.contractAddress = contractAddr;
    }


    async registUser( 
        pk_own, 
        pk_enc,
        eoa,
        userEthAddress    = _.get(Config, 'ethAddr'),
        userEthPrivateKey = _.get(Config, 'privKey'),
    ) {
        const gas = await this.contractMethod.registUserByDelegator(
            pk_own, pk_enc,eoa
        ).estimateGas();

        return this.sendContractCall(
            this.contractMethod.registUserByDelegator(pk_own, pk_enc, eoa),
            userEthAddress,
            userEthPrivateKey,
            gas
        );
    }

    async isRegisteredUser(addr) {
        return this.localContractCall(
            this.contractMethod.isRegisteredUser(addr)
        )
    }

    async getUserPK(address) {
        return this.localContractCall(
            this.contractMethod.getUserPk(address)
        )
    }

    async registData(
        proof,
        inputs,
        userEthAddress    = _.get(Config, 'ethAddr'),
        userEthPrivateKey = _.get(Config, 'privKey'),
    ) {
        if (proof.length != 8) {
            console.log('invalid proof length');
            return false;
        }
        if (inputs.length != 5) {
            console.log('invalid inputs length');
            return false;
        }
        const gas = await this.contractMethod.registData(proof, inputs).estimateGas();
        
        return this.sendContractCall(
            this.contractMethod.registData(proof, inputs),
            userEthAddress,
            userEthPrivateKey,
            gas
        )
    }

    async isRegisteredData(hCt) {
        return this.localContractCall(
            this.contractMethod.isRegistered(hCt)
        )
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
